from app.core.hashing import Hasher
from app.db.models.users import User
from app.schemas.user.users import UserCreate, UserUpdate
from app.schemas.pagination import Pagination, PaginationShow

from sqlalchemy.orm import Session


def create_new_user(user: UserCreate, db: Session):
    superuser = False
    if user.email == 'baonv@uit.edu.vn':
        superuser = True

    user = User(
        username=user.username,
        email=user.email,
        hashed_password=Hasher.get_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        sex=user.sex,
        birthday=user.birthday,
        language=user.language,
        phone=user.phone,
        is_active=True,
        is_superuser=superuser
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_all_user(pagination: Pagination, db: Session):
    if pagination.current == 0:
        pagination.current = 1
    offset = pagination.pageSize * (pagination.current-1)

    users = db.query(User).order_by(User.id).limit(pagination.pageSize).offset(offset=offset).all()
    total_count = db.query(User).count()

    pagination_result = {
        "current": pagination.current,
        "pageSize": pagination.pageSize,
        "total": total_count
    }
    return {"data": users, "pagination": pagination_result}

def get_user(username: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    return user

def get_user_by_email(email: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    return user


def get_user_by_username(username: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    return user


def delete_user_by_username(username: str, db: Session):
    user:User = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user


def set_supper_user(username: str, db: Session):
    user: User = db.query(User).filter(User.username == username).first()
    user.is_superuser = True
    db.commit()
    return user


def update_user_by_username(username: str, user_update: UserUpdate, db: Session):
    user: User = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle password hashing separately
    if 'password' in update_data:
        hashed_password = Hasher.get_password_hash(update_data['password'])
        setattr(user, 'hashed_password', hashed_password)
        del update_data['password']
    
    # Update other fields
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    return user


def delete_user_by_id(user_id: int, db: Session):
    user: User = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user


def update_user_by_id(user_id: int, user_update: UserUpdate, db: Session):
    user: User = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle password hashing separately
    if 'password' in update_data:
        hashed_password = Hasher.get_password_hash(update_data['password'])
        setattr(user, 'hashed_password', hashed_password)
        del update_data['password']
    
    # Update other fields
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user
