from pydantic import BaseModel, EmailStr, Field, validator
from typing import Any, List, Union, Optional
from datetime import datetime, date

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username must be between 3 and 50 characters")
    email: EmailStr = Field(..., description="Valid email address is required")
    password: str = Field(..., min_length=8, max_length=100, description="Password must be at least 8 characters")
    first_name: Union[str, None] = Field(None, max_length=50, description="First name must be less than 50 characters")
    last_name: Union[str, None] = Field(None, max_length=50, description="Last name must be less than 50 characters")
    sex: Union[int, None] = Field(None, ge=0, le=2, description="Sex: 0=Not specified, 1=Male, 2=Female")
    birthday: Union[date, None] = Field(None, description="Birthday date")
    language: Union[str, None] = Field(None, max_length=10, description="Language code (e.g., 'en', 'vi')")
    phone: Union[str, None] = Field(None, max_length=20, description="Phone number must be less than 20 characters")

    @validator('username')
    def username_must_not_contain_spaces(cls, v):
        if v and ' ' in v:
            raise ValueError('Username cannot contain spaces')
        if v and not v.strip():
            raise ValueError('Username cannot be empty or only whitespace')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        if v and not v.strip():
            raise ValueError('Password cannot be empty or only whitespace')
        if v and len(v.strip()) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('first_name', 'last_name')
    def name_fields_validation(cls, v):
        if v is not None and v.strip() == '':
            return None
        return v.strip() if v else v
    
    @validator('phone')
    def phone_validation(cls, v):
        if v is not None:
            # Remove spaces and check if it contains only digits, +, -, or ()
            cleaned = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if cleaned and not (cleaned[0] == '+' and cleaned[1:].isdigit() or cleaned.isdigit()):
                raise ValueError('Phone number must contain only digits and optional +, -, or ()')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Valid email address")
    password: Optional[str] = Field(None, min_length=8, max_length=100, description="Password must be at least 8 characters")
    first_name: Optional[str] = Field(None, max_length=50, description="First name must be less than 50 characters")
    last_name: Optional[str] = Field(None, max_length=50, description="Last name must be less than 50 characters")
    sex: Optional[int] = Field(None, ge=0, le=2, description="Sex: 0=Not specified, 1=Male, 2=Female")
    birthday: Optional[date] = Field(None, description="Birthday date")
    language: Optional[str] = Field(None, max_length=10, description="Language code (e.g., 'en', 'vi')")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number must be less than 20 characters")
    is_active: Optional[bool] = Field(None, description="User account active status")
    is_superuser: Optional[bool] = Field(None, description="Superuser privilege status")
    
    @validator('password')
    def password_strength(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Password cannot be empty or only whitespace')
            if len(v.strip()) < 8:
                raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('first_name', 'last_name')
    def name_fields_validation(cls, v):
        if v is not None and v.strip() == '':
            return None
        return v.strip() if v else v
    
    @validator('phone')
    def phone_validation(cls, v):
        if v is not None:
            # Remove spaces and check if it contains only digits, +, -, or ()
            cleaned = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if cleaned and not (cleaned[0] == '+' and cleaned[1:].isdigit() or cleaned.isdigit()):
                raise ValueError('Phone number must contain only digits and optional +, -, or ()')
        return v


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