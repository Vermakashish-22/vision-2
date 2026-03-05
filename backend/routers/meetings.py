from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Meeting, Participant
from schemas import MeetingCreate
import secrets
import string

router = APIRouter(prefix="/meetings", tags=["Meetings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_meeting_code(db: Session, length: int = 6):
    characters = string.ascii_uppercase + string.digits

    while True:
        random_part = ''.join(secrets.choice(characters) for _ in range(length))
        code = f"FMT-{random_part}"

        # 🔎 Check for collision
        existing = db.query(Meeting).filter(Meeting.code == code).first()
        if not existing:
            return code


@router.post("/create")
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):

    code = generate_meeting_code(db)

    meeting = Meeting(
        code=code,
        title=data.title,
        is_active=True
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting


@router.get("/today")
def get_today_meetings(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).filter(Meeting.is_active == True).all()
    return meetings


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).all()
    return meetings


@router.post("/join/{code}")
def join_meeting(code: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.code == code).first()

    if not meeting:
        return {"error": "Meeting not found"}

    participant = Participant(name="Guest", meeting_id=meeting.id)
    db.add(participant)
    db.commit()

    return {"message": "Joined"}