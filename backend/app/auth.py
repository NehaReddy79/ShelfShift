from passlib.context import CryptContext
from jose import jwt
from datetime import datetime , timedelta
from dotenv import load_dotenv
import os


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

    