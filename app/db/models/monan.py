from app.db.base_class import Base
from sqlalchemy import (Boolean, Column, Integer, String, DateTime)
from sqlalchemy.orm import relationship

class MonAn(Base):
    id = Column(Integer, primary_key=True, index=True)
    ten_mon_an = Column(String, nullable=False)
    mo_ta = Column(String)
    gia = Column(Integer)
    hinh_anh = Column(String)
    dia_chi = Column(String)
    nguoi_dong_gop = Column(String)
    is_deleted = Column(Boolean(), default=False)