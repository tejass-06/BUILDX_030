from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.models.officer import Officer
from app.services.supabase_service import is_supabase_configured, supabase_verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user: Optional[User] = None

    # 1. Try Supabase Auth verification if configured
    if is_supabase_configured():
        supabase_payload = supabase_verify_token(token)
        if supabase_payload:
            auth_user_id = supabase_payload.get("sub")
            email = supabase_payload.get("email")
            metadata = supabase_payload.get("user_metadata", {})
            
            # Lookup existing profile
            user = db.query(User).filter(
                (User.auth_user_id == auth_user_id) | (User.email == email)
            ).first()

            # Auto-provision profile if user signed up via Supabase Auth frontend SDK
            if not user and email:
                user = User(
                    auth_user_id=auth_user_id,
                    name=metadata.get("name") or metadata.get("full_name") or email.split("@")[0],
                    email=email,
                    phone=metadata.get("phone"),
                    role=metadata.get("role", UserRole.CITIZEN.value)
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            elif user and not user.auth_user_id and auth_user_id:
                user.auth_user_id = auth_user_id
                db.commit()

    # 2. Fallback to Local JWT verification (development/test or local token)
    if not user:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                if str(user_id).isdigit():
                    user = db.query(User).filter(User.id == int(user_id)).first()
                else:
                    user = db.query(User).filter(User.auth_user_id == str(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None

def require_role(allowed_roles: list[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in [role.value for role in allowed_roles] and current_user.role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

def get_current_citizen(
    current_user: User = Depends(get_current_user)
) -> User:
    return current_user

def get_current_officer(
    current_user: User = Depends(require_role([UserRole.OFFICER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
) -> tuple[User, Optional[Officer]]:
    officer = db.query(Officer).filter(Officer.user_id == current_user.id).first()
    return current_user, officer

def get_current_admin(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
) -> User:
    return current_user

# Alias for backward compatibility
require_officer = get_current_officer
require_admin = get_current_admin
