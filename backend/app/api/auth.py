from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash, decode_token
from app.db.mongodb import get_db
from app.schemas.models import User, UserCreate
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    db = get_db()
    # Check login_details for the session user
    login_info = await db.login_details.find_one({"username": username})
    if login_info is None:
        # Fallback for phone_number if needed, but we should stay consistent
        login_info = await db.login_details.find_one({"phone_number": username})
        
    if login_info is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return login_info

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    # Search by phone_number (standard for patients/doctors) or username
    user = await db.login_details.find_one({
        "$or": [
            {"phone_number": form_data.username},
            {"username": form_data.username}
        ]
    })
    
    if not user or not verify_password(form_data.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    identity = user.get("username") or user.get("phone_number")
    access_token = create_access_token(
        data={"sub": identity, "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}

@router.post("/admin-login")
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    admin = await db.login_details.find_one({
        "username": form_data.username,
        "role": "admin"
    })
    
    if not admin or not verify_password(form_data.password, admin.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": admin["username"], "role": "admin"}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "admin"}

def check_role(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        # Special case for hardcoded admin who might not be in the database
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

@router.post("/add-staff")
async def add_staff(
    user_in: UserCreate, 
    db=Depends(get_db), 
    current_user=Depends(check_role(["admin", "doctor"]))
):
    # Check login_details
    existing_login = await db.login_details.find_one({
        "$or": [
            {"phone_number": user_in.phone_number},
            {"username": user_in.email}
        ]
    })
    if existing_login:
        raise HTTPException(status_code=400, detail="User already exists")
    
    password_hash = get_password_hash(user_in.password) if user_in.password else None
    
    # Write to login_details for authentication and profile
    login_entry = {
        "identifier": user_in.phone_number,
        "phone_number": user_in.phone_number,
        "username": user_in.email,
        "name": user_in.name,
        "password_hash": password_hash,
        "role": "receptionist",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.login_details.insert_one(login_entry)
    return {"message": "Staff created successfully", "id": str(result.inserted_id)}

@router.post("/register")
async def register(user_in: UserCreate):
    db = get_db()
    existing_login = await db.login_details.find_one({"phone_number": user_in.phone_number})
    if existing_login:
        raise HTTPException(status_code=400, detail="User already exists")
    
    password_hash = get_password_hash(user_in.password) if user_in.password else None
    
    # Write to login_details
    login_entry = {
        "identifier": user_in.phone_number,
        "phone_number": user_in.phone_number,
        "name": user_in.name,
        "password_hash": password_hash,
        "role": user_in.role,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.login_details.insert_one(login_entry)
    
    return {"message": "User created successfully", "phone_number": user_in.phone_number}
