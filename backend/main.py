# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# import shutil
# import os
# import json
# from scipy.spatial.distance import cosine

from database import SessionLocal, engine, Base
# from models import User
# from face_utils import get_embedding
# from auth import hash_password, create_token

# # Create tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI()

# # Allow frontend connection (Next.js)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- SIGNUP ---------------- #

# @app.post("/signup")
# async def signup(
#     name: str = Form(...),
#     email: str = Form(...),
#     password: str = Form(...),
#     file: UploadFile = File(...)
# ):
#     db: Session = SessionLocal()

#     # Check if email already exists
#     existing_user = db.query(User).filter(User.email == email).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     image_path = f"temp_{file.filename}"
#     with open(image_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     try:
#         embedding = get_embedding(image_path)
#     except Exception as e:
#         os.remove(image_path)
#         raise HTTPException(status_code=400, detail="Face processing failed")

#     os.remove(image_path)

#     user = User(
#         name=name,
#         email=email,
#         password=hash_password(password),
#         face_embedding=json.dumps(embedding)
#     )

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     return {"message": "User registered successfully"}


# # ---------------- FACE LOGIN ---------------- #

# @app.post("/face-login")
# async def face_login(file: UploadFile = File(...)):
#     db: Session = SessionLocal()

#     image_path = f"login_{file.filename}"
#     with open(image_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     try:
#         new_embedding = get_embedding(image_path)
#     except Exception:
#         os.remove(image_path)
#         raise HTTPException(status_code=400, detail="No face detected")

#     os.remove(image_path)

#     users = db.query(User).all()

#     for user in users:
#         stored_embedding = json.loads(user.face_embedding)
#         distance = cosine(new_embedding, stored_embedding)

#         if distance < 0.45:  # Slightly relaxed threshold
#             token = create_token({"sub": user.email})
#             return {
#                 "message": "Login successful",
#                 "token": token,
#                 "user": {
#                     "name": user.name,
#                     "email": user.email
#                 }
#             }

#     raise HTTPException(status_code=401, detail="Face not recognized")


# # ---------------- ROOT CHECK ---------------- #

# @app.get("/")
# def root():
#     return {"status": "NeuroVision Backend Running"}


from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import numpy as np
import cv2
import os
import json
import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

app = FastAPI()

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)



@sio.event
async def connect(sid, environ):
    print("User connected:", sid)


@sio.event
async def join_room(sid, room):
    await sio.enter_room(sid, room)
    await sio.emit("user_joined", sid, room=room)


@sio.event
async def send_signal(sid, data):
    room = data["room"]
    await sio.emit("receive_signal", data, room=room, skip_sid=sid)


@sio.event
async def disconnect(sid):
    print("User disconnected:", sid)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FACE_DIR = "faces"
USER_DB = "users.json"

os.makedirs(FACE_DIR, exist_ok=True)

if not os.path.exists(USER_DB):
    with open(USER_DB, "w") as f:
        json.dump({}, f)


@app.post("/signup")
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...)
):

    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    face_path = f"{FACE_DIR}/{email}.jpg"

    cv2.imwrite(face_path, img)

    with open(USER_DB, "r") as f:
        users = json.load(f)

    users[email] = {
        "name": name,
        "face": face_path
    }

    with open(USER_DB, "w") as f:
        json.dump(users, f)

    return {"success": True, "message": "User registered"}

@app.post("/login-face")
async def login_face(file: UploadFile = File(...)):

    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_path = "temp_login.jpg"
    cv2.imwrite(temp_path, img)

    with open(USER_DB, "r") as f:
        users = json.load(f)

    for email, data in users.items():

        try:

            result = DeepFace.verify(
                img1_path=temp_path,
                img2_path=data["face"],
                model_name="ArcFace",
                enforce_detection=False
            )

            if result["verified"]:
                return {
                    "success": True,
                    "name": data["name"],
                    "email": email
                }

        except:
            pass

    return {"success": False, "message": "Face not recognized"}