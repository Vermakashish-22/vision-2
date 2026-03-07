import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetings } from "@/context/MeetingContext";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinMeetingDialog = ({ open, onOpenChange }: Props) => {
  const [code, setCode] = useState("");
  const { addToHistory, setActiveMeetingCode } = useMeetings();
  const navigate = useNavigate();

  if (!open) return null;

  const handleJoin = () => {

  if (!code.trim()) {
    toast.error("Enter meeting code");
    return;
  }

  let meetingCode = code.trim();

  // If user pasted full meeting link
  if (meetingCode.includes("/")) {
    const parts = meetingCode.split("/");
    meetingCode = parts[parts.length - 1].split("?")[0];
  }

  const userName = localStorage.getItem("username") || "Guest";

  setActiveMeetingCode(meetingCode);

  addToHistory({
    id: crypto.randomUUID(),
    title: `Meeting ${meetingCode}`,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    duration: "—",
    participants: 1,
    code: meetingCode,
    type: "joined"
  });

  onOpenChange(false);

  window.location.href = `https://juan-exopathic-dayfly.ngrok-free.dev/meeting/${meetingCode}?name=${userName}`;
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#0f172a] p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4">Join Meeting</h2>
        <input
          className="w-full p-3 rounded bg-[#1e293b] mb-4"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => onOpenChange(false)}>Cancel</button>
          <button
            onClick={handleJoin}
            className="bg-cyan-500 px-4 py-2 rounded text-black font-semibold"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinMeetingDialog;