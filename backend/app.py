from flask import Flask, render_template, request, redirect
from flask_socketio import SocketIO, join_room, emit, leave_room
import uuid
from flask_cors import CORS
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

users = {}   # socket_id -> username
rooms = {}
user_room = {}

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
    name = request.args.get("name","Host")

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


@socketio.on("join-room")
def join_room_event(data):

    room = data["room"]
    name = data["name"]

    join_room(room)

    user_room[request.sid] = room

    if room not in rooms:
        rooms[room] = {}

    # prevent duplicates
    if request.sid not in rooms[room]:
        rooms[room][request.sid] = name

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


@socketio.on("leave-room")
def handle_leave(data):

    room = data["room"]
    sid = request.sid

    if room in rooms and sid in rooms[room]:
        del rooms[room][sid]

    leave_room(room)

    socketio.emit("user-disconnected", sid, room=room)
    socketio.emit("update-users", rooms.get(room, {}), room=room)


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
    emit("offer", {"offer":data["offer"],"from":request.sid}, room=data["target"])


@socketio.on("answer")
def answer(data):
    emit("answer", {"answer":data["answer"],"from":request.sid}, room=data["target"])


@socketio.on("ice-candidate")
def ice(data):
    emit("ice-candidate", {"candidate":data["candidate"],"from":request.sid}, room=data["target"])


if __name__ == "__main__":
    print("Starting Flask SocketIO server...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)