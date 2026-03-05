import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

import { useMeetings } from "@/context/MeetingContext";
import { useUser } from "@/context/userContext";

import MeetingCard from "@/components/MeetingCard";
import ScheduleMeetingDialog from "@/components/ScheduleMeetingDialog";
import JoinMeetingDialog from "@/components/JoinMeetingDialog";
import Navbar from "@/components/Navbar";
import MeetingHistoryPage from "@/pages/MeetingHistoryPage";

const Dashboard = () => {
  const navigate = useNavigate();

  const {
    addToHistory,
    setActiveMeetingCode,
    scheduledMeetings,
    history,
  } = useMeetings();

  const { user } = useUser();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // 🔥 Create Instant Meeting
  const startTime = Date.now();
  const handleNewMeeting = () => {

  const code = `FMT-${Math.floor(1000 + Math.random() * 9000)}`;

  const meetingURL =
    `http://localhost:5000/?code=${code}&name=${user?.name}`;

  addToHistory({
    id: crypto.randomUUID(),
    title: "",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    startTime,
    duration: "",
    participants: 1,
    code,
    type: "hosted",
  });

  toast.success("Meeting Created!", {
    description: code
  });

  window.location.href = meetingURL;


};

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // 🔎 Search filter
  const filteredMeetings = scheduledMeetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white px-4">

      <Navbar />

      {/* Header */}
      <div className="mb-10 py-4 px-5">
        <h1 className="text-4xl font-bold">
          {getGreeting()},{" "}
          <span className="text-cyan-400">{user?.name || "User"}</span>
        </h1>

        <p className="text-gray-400 mt-2">
          {scheduledMeetings.length === 0
            ? "No meetings scheduled"
            : `You have ${scheduledMeetings.length} meeting(s)`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-5 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* New Meeting */}
        <button
          onClick={handleNewMeeting}
          className="bg-[#18191c] border border-gray-700 hover:border-cyan-400 p-6 rounded-xl text-left transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <Plus className="text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">New Meeting</h3>
              <p className="text-gray-400 text-sm">Start instantly</p>
            </div>
          </div>
        </button>

        {/* Schedule */}
        <button
          onClick={() => setScheduleOpen(true)}
          className="bg-[#18191c] border border-gray-700 hover:border-cyan-400 p-6 rounded-xl text-left transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <Calendar className="text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">Schedule</h3>
              <p className="text-gray-400 text-sm">Plan ahead</p>
            </div>
          </div>
        </button>

        {/* Join */}
        <button
          onClick={() => setJoinOpen(true)}
          className="bg-[#18191c] border border-gray-700 hover:border-cyan-400 p-6 rounded-xl text-left transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <Users className="text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">Join Meeting</h3>
              <p className="text-gray-400 text-sm">Enter code</p>
            </div>
          </div>
        </button>

      </div>

      {/* Meetings Section */}

      <div>

        <div className="flex justify-between items-center px-5 mb-6">
          <h2 className="text-xl font-semibold">
            {showHistory ? "Meeting History" : "Upcoming Meetings"}
          </h2>

          <button
            onClick={() => navigate("/history")}
            className="text-sm px-8 py-2 border font-bold border-cyan-400 text-cyan-400 rounded-xl hover:bg-cyan-400/10 transition"
          >
            History
          </button>
        </div>

        {/* History View */}
        {showHistory ? (
          history.length === 0 ? (
            <div className="text-gray-500 px-5 text-sm">
              No meeting history yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 py-4 px-5 md:grid-cols-2 gap-6">
              {history.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                />
              ))}
            </div>
          )
        ) : filteredMeetings.length === 0 ? (
          <div className="text-gray-500 px-5 text-sm">
            {search ? "No meetings found." : "No upcoming meetings yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 py-4 px-5 md:grid-cols-2 gap-6">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={{
                  id: meeting.id,
                  title: meeting.title,
                  time: meeting.time,
                  duration: meeting.duration,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}

      <ScheduleMeetingDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />

      <JoinMeetingDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
      />

    </div>
  );
};

export default Dashboard;