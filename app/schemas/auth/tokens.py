from pydantic import BaseModel
from app.schemas.user.users import ShowUser

class Token(BaseModel):
    access_token: str
    token_type: str
    user: ShowUser