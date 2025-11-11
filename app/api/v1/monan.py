import app.db.repository.monan as monan_repo

from app.db.session import get_db
from app.schemas.monan.monan import ShowMonAn, MonAnCreate
from app.schemas.pagination import Pagination, PaginationShow
from app.schemas.pagination_res import PaginationResponse
from app.db.models.users import User
from app.deps.auth import get_current_user_from_token

from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict


monan_router = APIRouter()

@monan_router.post(
    "/add",
    response_model=ShowMonAn)
def create_monan(
    monan: MonAnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    monan = monan_repo.create_new_monan(monan=monan, username=current_user.username, db=db)
    return monan


@monan_router.post("/all", response_model=PaginationResponse[ShowMonAn], summary="Get a list of all mon an"
)
def all_monan(
    pagination: Pagination,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    monans = monan_repo.get_all_monan(pagination=pagination, db=db)
    return monans

@monan_router.post(
        "/my-dishes", 
        response_model=PaginationResponse[ShowMonAn],
        summary="Get a list of all mon an of the currently logged in user"
)  
def my_dishes(
    pagination: Pagination,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    monans = monan_repo.get_all_monan_of_me(pagination=pagination, username=current_user.username, db=db)
    return monans

@monan_router.get("/{id}", response_model=ShowMonAn)
def get_monan(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    monan = monan_repo.get_monan(id=id, db=db)
    if not monan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MonAn not found"
        )
    return monan

@monan_router.delete(
        "/{id}", 
        response_model=ShowMonAn,
        summary="Delete a mon an by id (only for owner of the 'mon an')"
)
def delete_monan(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    monan = monan_repo.delete_monan(id=id, username=current_user.username, db=db)
    if not monan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MonAn not found"
        )
    return monan