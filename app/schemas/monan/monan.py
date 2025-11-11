from pydantic import BaseModel, EmailStr
from typing import Any, List, Union
from datetime import datetime, date

class MonAnCreate(BaseModel):
    ten_mon_an: str
    gia: Union[float, None]
    mo_ta: Union[str, None]
    hinh_anh: Union[str, None]
    dia_chi: Union[str, None]

class ShowMonAn(BaseModel):
    id: Any
    ten_mon_an: str
    gia: Union[float, None]
    mo_ta: Union[str, None]
    hinh_anh: Union[str, None]
    dia_chi: Union[str, None]
    nguoi_dong_gop: Union[str, None]
    
    class Config: # to convert non dict obj to json
        orm_mode = True