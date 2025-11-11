from app.db.session import get_db
from app.schemas.user.users import ShowUser
from app.schemas.user.users import UserCreate, UserUpdate
from app.schemas.pagination import Pagination, PaginationShow

from app.deps.auth import get_current_user_from_token
from app.db.models.users import User
from app.db.repository.users import *

from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict


user_router = APIRouter()


from pydantic import BaseModel
class ItemResponse(BaseModel):
    data: List[ShowUser]
    pagination: PaginationShow


@user_router.post(
    "/all", 
    response_model=ItemResponse,
    summary="Get a list of all users (only for superuser)"
)
def all_user(
    pagination: Pagination,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    users = get_all_user(pagination=pagination, db=db)
    return users


@user_router.post("/signup", response_model=ShowUser)
def create_user(user_create: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_username(username=user_create.username, db=db)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists."
        )
    
    user = get_user_by_email(email=user_create.email, db=db)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already used."
        )
    
    user = create_new_user(user=user_create, db=db)
    return user


@user_router.get("/me", response_model=ShowUser, summary="Get details of currently logged in user")
def get_me(user: User = Depends(get_current_user_from_token)):
    return user


@user_router.get(
    "/{username}",
    response_model=ShowUser,
    summary="Get user information by username (only for superuser)"
)
def get_user_info(
    username: str,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    # Check if current user is superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    
    # Get user by username
    user = get_user_by_username(username=username, db=db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return user


@user_router.delete(
        "/{username}", 
        summary="Delete a user by username (only for superuser)"
)
def delete_user(
    username: str,
    current_user: User = Depends(get_current_user_from_token), 
    db: Session = Depends(get_db)
):
    if current_user.is_superuser:
        user = delete_user_by_username(username=username, db=db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        return {"message": "Successfully deleted.", "detail": user}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="You are not permitted!!!"
    )


@user_router.put(
    "/{username}",
    response_model=ShowUser,
    summary="Update a user by username (only for superuser)"
)
def update_user(
    username: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    # Check if current user is superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    
    # Check if email is being updated and if it's already in use
    if user_update.email:
        existing_user = get_user_by_email(email=user_update.email, db=db)
        if existing_user and existing_user.username != username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already used by another user."
            )
    
    # Update the user
    updated_user = update_user_by_username(username=username, user_update=user_update, db=db)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return updated_user


@user_router.get(
    "/id/{user_id}",
    response_model=ShowUser,
    summary="Get user information by ID (only for superuser)"
)
def get_user_info_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    # Check if current user is superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    
    # Get user by ID
    user = get_user_by_id(user_id=user_id, db=db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return user


@user_router.delete(
    "/id/{user_id}",
    summary="Delete a user by ID (only for superuser)"
)
def delete_user_by_id_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    # Check if current user is superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    
    # Delete user by ID
    user = delete_user_by_id(user_id=user_id, db=db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return {"message": "Successfully deleted.", "detail": user}


@user_router.put(
    "/id/{user_id}",
    response_model=ShowUser,
    summary="Update a user by ID (only for superuser)"
)
def update_user_by_id_endpoint(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    # Check if current user is superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    
    # Check if email is being updated and if it's already in use
    if user_update.email:
        existing_user = get_user_by_email(email=user_update.email, db=db)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already used by another user."
            )
    
    # Update the user
    updated_user = update_user_by_id(user_id=user_id, user_update=user_update, db=db)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return updated_user
