import { Clock, Users } from "lucide-react";

interface Props {
  meeting: {
    id: string | number;
    title: string;
    date: string;
    time: string;
    duration: string;
    participants?: number;
    code?: string;
    type?: string;
  };
}

const MeetingHistoryCard = ({ meeting }: Props) => {
  return (
    <div className="flex items-center justify-between bg-[#18191c] border border-gray-700 hover:border-cyan-400 transition p-5 rounded-xl">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* icon */}
        <div className="bg-cyan-500/20 w-10 h-10 flex items-center justify-center rounded-lg text-cyan-400">
          ↗
        </div>

        {/* meeting info */}
        <div>
            <h3 className="font-semibold text-lg">
            {meeting.title && !meeting.title.startsWith("Meeting")
                ? meeting.title
                : meeting.code}
            </h3>

          <p className="text-gray-400 text-sm flex items-center gap-3 mt-1">

            <span className="flex items-center gap-1">
              <Clock size={14} />
              {meeting.date} • {meeting.time}
            </span>

            <span>• {meeting.duration}</span>

            <span className="flex items-center gap-1">
              <Users size={14} />
              {meeting.participants || 1}
            </span>

          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        <span className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-300">
          # {meeting.code || "FMT-0000"}
        </span>

        <span className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400">
          {meeting.type === "joined" ? "Joined" : "Hosted"}
        </span>

      </div>
    </div>
  );
};

export default MeetingHistoryCard;