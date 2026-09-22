from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.officer import Officer
from app.models.department import Department
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse, OfficerRequestResponse
from app.services.supabase_service import is_supabase_configured, supabase_sign_up, supabase_sign_in

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Determine role & active status
    is_officer_request = payload.role in [UserRole.OFFICER, UserRole.OFFICER_PENDING] or payload.department_code is not None
    user_role = UserRole.OFFICER_PENDING.value if is_officer_request else (payload.role.value if payload.role else UserRole.CITIZEN.value)
    user_is_active = False if is_officer_request else True

    auth_user_id = None
    access_token = None

    # If Supabase is configured, register user in Supabase Auth
    if is_supabase_configured():
        try:
            auth_user_id, access_token = supabase_sign_up(
                email=payload.email,
                password=payload.password,
                metadata={
                    "name": payload.name,
                    "role": user_role,
                    "phone": payload.phone
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Supabase Auth registration error: {str(e)}"
            )

    # Save User profile in Application Database
    user = User(
        auth_user_id=auth_user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password) if not is_supabase_configured() else None,
        role=user_role,
        is_active=user_is_active
    )
    db.add(user)
    db.flush()

    # If officer registration request, create pending officer profile
    dept_code = None
    officer_id = None
    if is_officer_request:
        dept = None
        if payload.department_code:
            dept = db.query(Department).filter(
                (Department.code == payload.department_code) | (Department.name.ilike(f"%{payload.department_code}%"))
            ).first()
        if not dept:
            dept = db.query(Department).first()
        
        if dept:
            officer = Officer(
                user_id=user.id,
                department_id=dept.id,
                zone=payload.zone or "North Zone",
                designation=payload.designation or "Junior Engineer"
            )
            db.add(officer)
            db.flush()
            officer_id = officer.id
            dept_code = dept.code

    db.commit()
    db.refresh(user)

    # Generate token only if user is active (citizen). Pending officers must be approved by admin.
    if user.is_active and not access_token:
        access_token = create_access_token(subject=user.id, role=user.role)
    elif not user.is_active:
        access_token = "PENDING_ADMIN_APPROVAL"

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        department_code=dept_code,
        officer_id=officer_id
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    access_token = None

    # If Supabase Auth is configured, authenticate via Supabase Auth
    if is_supabase_configured():
        try:
            auth_user_id, access_token, metadata = supabase_sign_in(payload.email, payload.password)
            if not user and auth_user_id:
                # Auto-sync profile if not found
                user = User(
                    auth_user_id=auth_user_id,
                    name=(metadata or {}).get("name") or payload.email.split("@")[0],
                    email=payload.email,
                    role=(metadata or {}).get("role", UserRole.CITIZEN.value),
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            elif user and not user.auth_user_id:
                user.auth_user_id = auth_user_id
                db.commit()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
    else:
        # Local password verification
        if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

    # Verify Account Status & Officer Approval
    if user.role == UserRole.OFFICER_PENDING.value or (user.role == UserRole.OFFICER.value and not user.is_active):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer registration is pending Admin verification and approval."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact NagarSaathi Administrator."
        )

    dept_code = None
    officer_id = None
    if user and user.officer_profile:
        officer_id = user.officer_profile.id
        if user.officer_profile.department:
            dept_code = user.officer_profile.department.code

    if not access_token:
        access_token = create_access_token(subject=user.id, role=user.role)

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        department_code=dept_code,
        officer_id=officer_id
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    dept_code = None
    officer_id = None
    if current_user.officer_profile:
        officer_id = current_user.officer_profile.id
        if current_user.officer_profile.department:
            dept_code = current_user.officer_profile.department.code

    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        department_code=dept_code,
        officer_id=officer_id
    )

# ================= ADMIN OFFICER APPROVAL WORKFLOW =================

@router.get("/officer-requests", response_model=List[OfficerRequestResponse])
def list_pending_officer_requests(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint: List all pending officer registration requests"""
    pending_users = db.query(User).filter(
        (User.role == UserRole.OFFICER_PENDING.value) | ((User.role == UserRole.OFFICER.value) & (User.is_active == False))
    ).order_by(User.created_at.desc()).all()

    result = []
    for u in pending_users:
        dept_name = u.officer_profile.department.name if u.officer_profile and u.officer_profile.department else None
        dept_code = u.officer_profile.department.code if u.officer_profile and u.officer_profile.department else None
        zone = u.officer_profile.zone if u.officer_profile else None
        designation = u.officer_profile.designation if u.officer_profile else None

        result.append(OfficerRequestResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            phone=u.phone,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            department_name=dept_name,
            department_code=dept_code,
            zone=zone,
            designation=designation
        ))
    return result

@router.post("/officer-requests/{user_id}/approve", response_model=UserResponse)
def approve_officer_request(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint: Approve pending officer and grant active OFFICER role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = UserRole.OFFICER.value
    user.is_active = True
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    dept_code = user.officer_profile.department.code if user.officer_profile and user.officer_profile.department else None
    officer_id = user.officer_profile.id if user.officer_profile else None

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        department_code=dept_code,
        officer_id=officer_id
    )

@router.post("/officer-requests/{user_id}/reject")
def reject_officer_request(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint: Reject pending officer registration"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": f"Officer request for {user.email} has been rejected."}

@router.post("/officers/{user_id}/deactivate")
def deactivate_officer(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint: Deactivate an officer account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": f"Officer {user.name} ({user.email}) deactivated."}
