from pydantic import BaseModel
from datetime import datetime

class MeetingCreate(BaseModel):
    title: str


class MeetingResponse(BaseModel):
    id: int
    code: str
    title: str
    created_at: datetime
    is_active: bool

    class Config:
        orm_mode = True