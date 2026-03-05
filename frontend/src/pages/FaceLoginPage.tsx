import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export default function FaceLoginPage() {

const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);

const navigate = useNavigate();
const { setUser } = useUser();

const [cameraReady,setCameraReady] = useState(false);
const [status,setStatus] = useState("idle");

useEffect(()=>{

if(!window.FaceMesh || !window.Camera) return;

const video = videoRef.current;
const canvas = canvasRef.current;
const ctx = canvas?.getContext("2d");

if(!video || !canvas || !ctx) return;

const faceMesh = new window.FaceMesh({
locateFile:(file:string)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
maxNumFaces:1,
refineLandmarks:true,
minDetectionConfidence:0.7,
minTrackingConfidence:0.7
});

faceMesh.onResults((results:any)=>{

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.drawImage(results.image,0,0,canvas.width,canvas.height);

if(results.multiFaceLandmarks){

for(const landmarks of results.multiFaceLandmarks){

for(let i=0;i<landmarks.length;i++){

const x = landmarks[i].x * canvas.width;
const y = landmarks[i].y * canvas.height;

ctx.beginPath();
ctx.arc(x,y,1.2,0,2*Math.PI);
ctx.fillStyle="#00ffff";
ctx.fill();

}

}

}

});

const camera = new window.Camera(video,{
onFrame: async ()=>{
await faceMesh.send({image:video});
},
width:640,
height:640
});

camera.start();
setCameraReady(true);

},[]);



const verifyFace = async ()=>{

if(!canvasRef.current) return;

setStatus("scanning");

const canvas = canvasRef.current;

canvas.toBlob(async(blob)=>{

const formData = new FormData();
formData.append("file",blob!,"frame.jpg");

try{

const res = await fetch("http://127.0.0.1:8000/login-face",{
method:"POST",
body:formData
});

const data = await res.json();

if(data.success){
  setUser(
    {
      name: data.name,
      email: data.email || "",
      imageUrl: ""
    });

  toast.success("Face recognized!");
  navigate("/dashboard");

}else{

setStatus("error");
toast.error("Face not recognized");

}

}catch{

toast.error("Backend not running");

}

},"image/jpeg");

};



return(

<div className="min-h-screen flex items-center justify-center bg-[#020617]">

<div className="flex flex-col items-center gap-8">

<h1 className="text-3xl text-white font-semibold">
Face<span className="text-cyan-400">Meet</span>
</h1>

<div className="relative w-[40vw] max-w-[520px] aspect-square rounded-2xl overflow-hidden border border-cyan-400/30">

<video
ref={videoRef}
className="hidden"
/>

<canvas
ref={canvasRef}
className="w-full h-full"
/>


{status==="scanning" && (

<motion.div
className="absolute left-0 right-0 h-[3px] bg-cyan-400"
animate={{top:["0%","100%","0%"]}}
transition={{duration:2,repeat:Infinity}}
/>

)}

{status==="success" && (

<div className="absolute inset-0 flex items-center justify-center bg-black/60 text-green-400 text-2xl">

Face Verified ✔

</div>

)}

</div>


<Button
onClick={verifyFace}
disabled={!cameraReady}
className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 text-lg"
>

<Scan className="mr-2"/>

Scan Face

</Button>

</div>

</div>

);

}