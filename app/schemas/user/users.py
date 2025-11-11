from pydantic import BaseModel, EmailStr
from typing import Any, List, Union
from datetime import datetime, date

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Union[str, None]
    last_name: Union[str, None]
    sex: Union[int, None]
    birthday: Union[date, None]
    language: Union[str, None]
    phone: Union[str, None]


class ShowRole(BaseModel):
    role_id: int
    detail: str

    class Config: # to convert non dict obj to json
        orm_mode = True

class ShowUser(BaseModel):
    id: Any
    username: str
    email: EmailStr
    email_verified: bool
    first_name: Union[str, None]
    last_name: Union[str, None]
    avatar: Union[str, None]
    sex: Union[int, None]
    birthday: Union[date, None]
    language: Union[str, None]
    phone: Union[str, None]
    phone_verified: Union[bool, None]
    is_active: Union[bool, None]
    is_superuser: Union[bool, None]

    class Config: # to convert non dict obj to json
        orm_mode = True