import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Upload, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/userContext";
import { toast } from "sonner";

const SignupPage = () => {

const navigate = useNavigate();
const { setUser } = useUser();

const fileInputRef = useRef<HTMLInputElement>(null);

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [imagePreview,setImagePreview] = useState<string | null>(null);
const [loading,setLoading] = useState(false);


const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

const file = e.target.files?.[0];

if(!file) return;

const reader = new FileReader();

reader.onloadend = () => {
setImagePreview(reader.result as string);
};

reader.readAsDataURL(file);

};


const handleSignup = async (e) => {

  e.preventDefault();

  const formData = new FormData();

  formData.append("name", name);
  formData.append("email", email);
  formData.append("file", fileInputRef.current.files[0]);

  const res = await fetch("http://127.0.0.1:8000/signup", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if(data.success){
     toast.success("Account created");
     navigate("/login");
  } else {
     toast.error("Signup failed");
  }

};


return(
<div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">

{/* background glow */}
<div className="absolute w-[700px] h-[700px] bg-cyan-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>

<div className="w-[420px] p-8 rounded-2xl border border-cyan-500/20 bg-[#020617]/80 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,255,0.08)]">

{/* logo */}
<div className="flex items-center justify-center gap-2 mb-6">
<Shield className="text-cyan-400"/>
<h1 className="text-2xl font-semibold text-white">
Face<span className="text-cyan-400">Meet</span>
</h1>
</div>

{/* upload circle */}

<div className="flex flex-col items-center gap-3 mb-6">

<input
type="file"
accept="image/*"
ref={fileInputRef}
onChange={handleImageUpload}
className="hidden"
/>

<button
type="button"
onClick={()=>fileInputRef.current?.click()}
className="w-24 h-24 rounded-full border border-dashed border-cyan-400/40 flex items-center justify-center hover:border-cyan-400 transition"
>

{imagePreview ?

<img
src={imagePreview}
className="w-full h-full object-cover rounded-full"
/>

:

<Upload className="text-cyan-400"/>

}

</button>

<p className="text-sm text-gray-400">
Upload face photo
</p>

</div>

{/* inputs */}

<div className="space-y-4">

<Input
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="bg-[#020617] border border-cyan-400/30 text-white"
/>

<Input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="bg-[#020617] border border-cyan-400/30 text-white"
/>

<div className="relative">

<Input
type={showPassword ? "text":"password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="bg-[#020617] border border-cyan-400/30 text-white pr-10"
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-3 top-3 text-gray-400"
>
{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

</div>

</div>

{/* button */}

<Button
onClick={handleSignup}
className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(0,255,255,0.3)]"
>
Create Account →
</Button>

{/* login link */}

<p className="text-center text-gray-400 mt-6 text-sm">

Already registered?

<span
onClick={()=>navigate("/login")}
className="text-cyan-400 cursor-pointer ml-2"
>

Login with Face ID

</span>

</p>

</div>
</div>

);

};

export default SignupPage;