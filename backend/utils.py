import base64
import cv2
import numpy as np


def decode_base64_image(image_data):

    header, encoded = image_data.split(",", 1)

    image_bytes = base64.b64decode(encoded)

    np_arr = np.frombuffer(image_bytes, np.uint8)

    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    return img


def detect_face(image):

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    return len(faces) > 0