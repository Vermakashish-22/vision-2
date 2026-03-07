from flask import Flask, render_template, request, send_file
from flask_socketio import SocketIO, join_room, emit, leave_room
from flask_cors import CORS
from collections import defaultdict
from deepface import DeepFace

import uuid
import eventlet
import os
import matplotlib.pyplot as plt

from utils import decode_base64_image, detect_face

eventlet.monkey_patch()


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


rooms = {}
user_room = {}
hosts = {}
distraction_frames = {}
distraction_count = {}

focus_memory = {}

meeting_analytics = defaultdict(lambda: defaultdict(lambda: {
    "focus": [],
    "distraction": [],
    "emotion": []
}))

PUBLIC_URL = "https://juan-exopathic-dayfly.ngrok-free.dev"


@app.route("/")
def index():

    code = request.args.get("code")
    username = request.args.get("name", "Guest")

    return render_template(
        "index.html",
        code=code,
        username=username
    )

@app.route("/create-meeting")
def create_meeting():

    room_id = str(uuid.uuid4())[:8]
    name = request.args.get("name", "Host")

    meeting_link = f"{PUBLIC_URL}/meeting/{room_id}?name={name}&host=true"

    return render_template(
        "create_meeting.html",
        room_id=room_id,
        meeting_link=meeting_link,
        username=name
    )


@app.route("/meeting/<room_id>")
def meeting(room_id):

    username = request.args.get("name", "Guest")
    is_host = request.args.get("host", "true")

    return render_template(
        "meeting.html",
        room_id=room_id,
        username=username,
        is_host=is_host
    )


@app.route("/report/<room>")
def report_view(room):

    data = meeting_analytics.get(room, {})

    return render_template(
        "report.html",
        room_id=room,
        analytics=data
    )


@app.route("/download-report/<room>")
def download_report(room):

    path = generate_meeting_report(room)

    if path:
        return send_file(path, as_attachment=True)

    return "No report data available"


@socketio.on("join-room")
def join_room_event(data):

    room = data["room"]
    name = data["name"]
    is_host = data.get("host", False)

    join_room(room)

    user_room[request.sid] = room

    if room not in rooms:
        rooms[room] = {}

    rooms[room][request.sid] = name

    if room not in hosts and is_host:
        hosts[room] = request.sid

    socketio.emit("update-users", rooms[room], room=room)


@socketio.on("get-users")
def get_users():

    room = user_room.get(request.sid)
    users = rooms.get(room, {})

    user_list = [
        {"id": sid, "name": name}
        for sid, name in users.items()
    ]

    emit("existing-users", user_list)


@socketio.on("request-existing-analytics")
def send_existing_analytics(data):

    room = data["room"]

    analytics = meeting_analytics.get(room, {})

    for user in analytics:

        focus_list = analytics[user]["focus"]
        distraction_list = analytics[user]["distraction"]
        emotion_list = analytics[user]["emotion"]

        if not focus_list:
            continue

        socketio.emit(
            "emotion-result",
            {
                "user": user,
                "emotion": emotion_list[-1],
                "focus": focus_list[-1],
                "distraction": distraction_list[-1],
                "distraction_count": len(
                    [d for d in distraction_list if d > 60]
                )
            },
            to=request.sid
        )


@socketio.on("leave-room")
def handle_leave(data):

    room = data["room"]
    sid = request.sid

    if room in rooms and sid in rooms[room]:
        del rooms[room][sid]

    leave_room(room)

    socketio.emit("user-disconnected", sid, room=room)
    socketio.emit("update-users", rooms.get(room, {}), room=room)


@socketio.on("analyze-frame")
def analyze_frame(data):

    image_data = data["image"]
    user = data.get("user") or request.sid
    room = data["room"]

    image = decode_base64_image(image_data)


    result = DeepFace.analyze(
        image,
        actions=['emotion'],
        enforce_detection=False
    )

    if isinstance(result, list):
        emotion = result[0]["dominant_emotion"]
    else:
        emotion = result["dominant_emotion"]

    
    face_present, face_box = detect_face(image)

    focus = 5

    if face_present and face_box is not None:

        x, y, w, h = face_box

        img_h, img_w = image.shape[:2]

        face_center_x = x + w/2
        face_center_y = y + h/2

        frame_center_x = img_w / 2
        frame_center_y = img_h / 2

        offset_x = abs(face_center_x - frame_center_x)
        offset_y = abs(face_center_y - frame_center_y)

        tolerance_x = img_w * 0.25
        tolerance_y = img_h * 0.25

        if offset_x < tolerance_x and offset_y < tolerance_y:
            focus = 85
        else:
            focus = 40

    prev_focus = focus_memory.get(user, focus)

    focus = int((prev_focus * 0.75) + (focus * 0.25))

    focus_memory[user] = focus

    distraction = 100 - focus

    if user not in distraction_frames:
        distraction_frames[user] = 0

    if user not in distraction_count:
        distraction_count[user] = 0

    if focus < 50:

        distraction_frames[user] += 1

        if distraction_frames[user] >= 3:

            distraction_count[user] += 1
            distraction_frames[user] = 0

    else:

        distraction_frames[user] = 0


    meeting_analytics[room][user]["focus"].append(focus)
    meeting_analytics[room][user]["distraction"].append(distraction)
    meeting_analytics[room][user]["emotion"].append(emotion)


    host_sid = hosts.get(room)

    if host_sid:
        print("Sending analytics to host:", emotion, focus, distraction)
        socketio.emit(
            "emotion-result",
            {
                "user": user,
                "emotion": emotion,
                "focus": focus,
                "distraction": distraction,
                "distraction_count": distraction_count[user]
            },
            to=host_sid
        )


@socketio.on("disconnect")
def on_disconnect():

    sid = request.sid

    for room in list(rooms.keys()):

        if sid in rooms[room]:

            del rooms[room][sid]

            socketio.emit("user-disconnected", sid, room=room)
            socketio.emit("update-users", rooms[room], room=room)


@socketio.on("offer")
def offer(data):

    emit(
        "offer",
        {"offer": data["offer"], "from": request.sid},
        room=data["target"]
    )


@socketio.on("answer")
def answer(data):

    emit(
        "answer",
        {"answer": data["answer"], "from": request.sid},
        room=data["target"]
    )


@socketio.on("ice-candidate")
def ice(data):

    emit(
        "ice-candidate",
        {"candidate": data["candidate"], "from": request.sid},
        room=data["target"]
    )


def generate_meeting_report(room):

    data = meeting_analytics.get(room, {})

    if not data:
        return None

    os.makedirs("reports", exist_ok=True)

    report_path = f"reports/{room}_report.pdf"

    participants = list(data.keys())

    avg_focus = []
    avg_distraction = []
    emotion_count = {}

    for user in participants:

        f = data[user]["focus"]
        d = data[user]["distraction"]
        e = data[user]["emotion"]

        avg_focus.append(sum(f) / len(f))
        avg_distraction.append(sum(d) / len(d))

        for emo in e:
            emotion_count[emo] = emotion_count.get(emo, 0) + 1



    focus_chart = f"reports/{room}_focus.png"
    distraction_chart = f"reports/{room}_distraction.png"
    emotion_chart = f"reports/{room}_emotion.png"

    plt.figure()
    plt.bar(participants, avg_focus)
    plt.title("Average Focus Level")
    plt.ylabel("Focus %")
    plt.savefig(focus_chart)
    plt.close()

    plt.figure()
    plt.bar(participants, avg_distraction)
    plt.title("Average Distraction Level")
    plt.ylabel("Distraction %")
    plt.savefig(distraction_chart)
    plt.close()

    plt.figure()
    plt.pie(
        emotion_count.values(),
        labels=emotion_count.keys(),
        autopct="%1.1f%%"
    )
    plt.title("Emotion Distribution")
    plt.savefig(emotion_chart)
    plt.close()


    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("FaceMeet AI Meeting Report", styles['Title']))
    story.append(Spacer(1, 20))

    story.append(Paragraph(f"Room ID: {room}", styles['Normal']))
    story.append(Spacer(1, 20))

    story.append(Image(focus_chart, width=450, height=250))
    story.append(Spacer(1, 20))

    story.append(Image(distraction_chart, width=450, height=250))
    story.append(Spacer(1, 20))

    story.append(Image(emotion_chart, width=450, height=250))

    doc = SimpleDocTemplate(report_path)
    doc.build(story)

    return report_path

if __name__ == "__main__":

    print("Starting FaceMeet Server...")

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )