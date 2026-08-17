from passlib.context import CryptContext
from jose import jwt
from datetime import datetime , timedelta
from dotenv import load_dotenv
import os
from fastapi import Request , Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"] , deprecated = "auto")

def hash_password(password : str):
    return pwd_context.hash(password)

def verify_password(plain_pass : str, hashed_pass):
    return pwd_context.verify(plain_pass , hashed_pass)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

def create_access_token(data : dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp" : expire})

    return jwt.encode(to_encode , SECRET_KEY , algorithm=ALGORITHM )

def decode_access_token(token : str):
    try:
        return jwt.decode(token , SECRET_KEY , algorithms=[ALGORITHM])
    except Exception:
        return None


def get_current_user_opt(request : Request , db : Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None : 
        return None

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user 
    