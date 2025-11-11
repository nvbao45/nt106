from app.core.hashing import Hasher
from app.db.models.monan import MonAn
from app.schemas.user.users import UserCreate
from app.schemas.monan.monan import MonAnCreate, ShowMonAn
from app.schemas.pagination import Pagination, PaginationShow

from fastapi import HTTPException
from fastapi import status
from sqlalchemy.orm import Session
from sqlalchemy import and_


def create_new_monan(monan: MonAnCreate, username: str, db: Session):
    monan = MonAn(
        ten_mon_an=monan.ten_mon_an,
        mo_ta=monan.mo_ta if monan.mo_ta else "",
        gia=monan.gia if monan.gia else 0,
        dia_chi=monan.dia_chi if monan.dia_chi else "",
        hinh_anh=monan.hinh_anh if monan.hinh_anh else "",
        nguoi_dong_gop=username
    )
    db.add(monan)
    db.commit()
    db.refresh(monan)
    return monan


def get_all_monan(pagination: Pagination, db: Session):
    if pagination.current == 0:
        pagination.current = 1
    offset = pagination.pageSize * (pagination.current-1)

    monans = db.query(MonAn).filter(MonAn.is_deleted == False).order_by(MonAn.id).limit(pagination.pageSize).offset(offset=offset).all()
    total_count = db.query(MonAn).filter(MonAn.is_deleted == False).count()

    pagination_result = {
        "current": pagination.current,
        "pageSize": pagination.pageSize,
        "total": total_count
    }
    return {"data": monans, "pagination": pagination_result}

def get_all_monan_of_me(pagination: Pagination, username: str, db: Session):
    if pagination.current == 0:
        pagination.current = 1
    offset = pagination.pageSize * (pagination.current-1)

    monans = db.query(MonAn).order_by(MonAn.id).filter(and_(MonAn.nguoi_dong_gop == username, MonAn.is_deleted == False)).limit(pagination.pageSize).offset(offset=offset).all()
    total_count = db.query(MonAn).filter(and_(MonAn.nguoi_dong_gop == username, MonAn.is_deleted == False)).count()

    pagination_result = {
        "current": pagination.current,
        "pageSize": pagination.pageSize,
        "total": total_count
    }
    return {"data": monans, "pagination": pagination_result}

def get_monan(id: int, db: Session):
    user = db.query(MonAn).filter(and_(MonAn.id == id, MonAn.is_deleted == False)).first()
    return user

def delete_monan(id: int, username: str, db: Session, is_superuser: bool = False):
    monan = db.query(MonAn).filter(MonAn.id == id).first()
    if not is_superuser and monan.nguoi_dong_gop != username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    monan.is_deleted = True
    db.commit()
    return monan

def update_monan(id: int, monan: MonAnCreate, username: str, db: Session, is_superuser: bool = False):
    existing_monan = db.query(MonAn).filter(MonAn.id == id).first()
    if not is_superuser and existing_monan.nguoi_dong_gop != username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not permitted!!!!"
        )
    existing_monan.ten_mon_an = monan.ten_mon_an
    existing_monan.mo_ta = monan.mo_ta if monan.mo_ta else ""
    existing_monan.gia = monan.gia if monan.gia else 0
    existing_monan.dia_chi = monan.dia_chi if monan.dia_chi else ""
    existing_monan.hinh_anh = monan.hinh_anh if monan.hinh_anh else ""
    db.commit()
    db.refresh(existing_monan)
    return existing_monan