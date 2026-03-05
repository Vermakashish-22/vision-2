from deepface import DeepFace

def get_embedding(image_path):
    embedding = DeepFace.represent(
        img_path=image_path,
        model_name="Facenet",
        enforce_detection=True
    )
    return embedding[0]["embedding"]