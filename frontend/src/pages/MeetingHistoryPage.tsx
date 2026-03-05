import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMeetings } from "@/context/MeetingContext";
import MeetingCard from "@/components/MeetingCard";
import Navbar from "@/components/Navbar";
import MeetingHistoryCard from "@/components/MeetingHistoryCard";

const MeetingHistoryPage = () => {
  const navigate = useNavigate();
  const { history } = useMeetings();

  return (
    <div className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="px-6 py-6">

        {/* Header */}
       <div className="flex items-center gap-3 mb-8">

        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 border border-gray-700 rounded-lg hover:border-cyan-400 transition"
        >
          <ArrowLeft className="text-cyan-400" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="text-cyan-400 px-2"> Meeting History</span>
          </h1>

          <p className="text-gray-400 text-sm px-2">
            {history.length} past meetings
          </p>
        </div>

      </div>
        {/* History List */}
        {history.length === 0 ? (
          <div className="text-gray-400">
            No meetings attended yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((meeting) => (
              <MeetingHistoryCard
                key={meeting.id}
                meeting={meeting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingHistoryPage;