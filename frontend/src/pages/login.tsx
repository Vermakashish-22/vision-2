import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Initializing camera...");
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("Scanning...");
      startAutoScan();
    } catch {
      setStatus("Camera access denied");
    }
  };

  const captureFrame = async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    );
  };

  const startAutoScan = () => {
    const interval = setInterval(async () => {
      const blob = await captureFrame();
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/face-login",
          formData
        );

        if (response.data.token) {
          clearInterval(interval);
          localStorage.setItem("token", response.data.token);
          navigate("/dashboard");
        }
      } catch {
        setStatus("Scanning...");
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl mb-6 text-cyan-400">Face Authentication</h1>

      <div className="border-4 border-cyan-500 rounded-lg shadow-lg shadow-cyan-500/40">
        <video ref={videoRef} autoPlay className="w-[400px] rounded-lg" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <p className="mt-4 text-cyan-300">{status}</p>
    </div>
  );
}