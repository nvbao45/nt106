from fastapi.responses import JSONResponse
import requests

from datetime import timedelta, datetime

from app.core.config import settings
from app.core.hashing import Hasher
from app.core.security import create_access_token
from app.db.repository.users import get_user, get_user_by_email
from app.db.session import get_db
from app.db.models.users import User
from app.schemas.auth.tokens import Token
from app.schemas.user.users import ShowUser
from app.deps.auth import decode_token, create_refresh_token, valid_email_from_db
from app.deps.auth import get_current_user_from_token
from app.contants.http_exception import *

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from fastapi import Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder

from sqlalchemy.orm import Session


auth_router = APIRouter()


def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user: User = get_user(username=username, db=db)
    if not user:
        user: User = get_user_by_email(email=username, db=db)
        if not user:
            return False

    if not Hasher.verify_password(password, user.hashed_password):
        return False
    
    return user


@auth_router.post("/token", response_model=Token, summary="Get access token")
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user: ShowUser = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not activated!!!!"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": user.username}, expires_delta=access_token_expires
    )
    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}", httponly=True
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@auth_router.post('/refresh')
async def refresh_token(request: Request):
    try:
        if request.method == 'POST':
            form = await request.json()
            if form.get('grant_type') == 'refresh_token':
                token = form.get('refresh_token')
                payload = decode_token(token)
                if datetime.utcfromtimestamp(payload.get('exp')) > datetime.utcnow():
                    email = payload.get('sub')
                    if valid_email_from_db(email):
                        return JSONResponse({'result': True, 'access_token': create_refresh_token(email)})
    except Exception:
        raise CREDENTIALS_EXCEPTION
    raise CREDENTIALS_EXCEPTION
