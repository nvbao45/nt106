from typing import Dict, Union, Optional
from pydantic import BaseModel

from fastapi import HTTPException
from fastapi import Request
from fastapi import status
from fastapi.openapi.models import OAuthFlows
from fastapi.security import OAuth2

from datetime import datetime, timedelta

from fastapi.security.utils import get_authorization_scheme_param
from fastapi import Depends

from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.db.repository.users import get_user, get_user_by_email
from app.contants.http_exception import CREDENTIALS_EXCEPTION

class OAuth2PasswordBearerWithHeader(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Union[str, None] = None,
        scopes: Union[Dict[str, str], None] = None,
        auto_error: bool = True
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlows(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)
    
    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get(
            "Authorization"
        )

        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            else:
                return None
        return param

oauth2_scheme = OAuth2PasswordBearerWithHeader(tokenUrl=f"/auth/token")

# Create token internal function
def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(email):
    expires = timedelta(minutes=settings)
    return create_access_token(data={'sub': email}, expires_delta=expires)

# Create token for an email
def create_token(email):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub': email}, expires_delta=access_token_expires)
    return access_token

def valid_email_from_db(email):
    return get_user_by_email(email) != None

def decode_token(token):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

async def get_current_user_email(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        email: str = payload.get('sub')
        if email is None:
            raise CREDENTIALS_EXCEPTION
    except jwt.PyJWTError:
        raise CREDENTIALS_EXCEPTION

    if valid_email_from_db(email):
        return email

    raise CREDENTIALS_EXCEPTION


async def get_current_user_token(token: str = Depends(oauth2_scheme)):
    _ = await get_current_user_email(token)
    return token


def get_current_user_from_token(
    token: str  = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = decode_token(token)
        username: str = payload.get("username")
        if username is None:
            raise CREDENTIALS_EXCEPTION
        
        user = get_user(username=username, db=db)
        return user
    except JWTError:
        raise CREDENTIALS_EXCEPTION