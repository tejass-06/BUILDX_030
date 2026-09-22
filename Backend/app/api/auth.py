from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.officer import Officer
from app.models.department import Department
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
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
                    "role": payload.role.value if payload.role else UserRole.CITIZEN.value,
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
        role=payload.role.value if payload.role else UserRole.CITIZEN.value
    )
    db.add(user)
    db.flush()

    # If officer/admin role, create officer profile
    dept_code = None
    officer_id = None
    if user.role in [UserRole.OFFICER.value, UserRole.ADMIN.value]:
        dept = None
        if payload.department_code:
            dept = db.query(Department).filter(Department.code == payload.department_code).first()
        if not dept:
            dept = db.query(Department).filter(Department.code == "ROAD").first()
        
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

    # Fallback to local JWT token if not provided by Supabase Auth
    if not access_token:
        access_token = create_access_token(subject=user.id, role=user.role)

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
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
                    role=(metadata or {}).get("role", UserRole.CITIZEN.value)
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
        created_at=current_user.created_at,
        department_code=dept_code,
        officer_id=officer_id
    )
