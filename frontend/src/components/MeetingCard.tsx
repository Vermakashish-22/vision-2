interface Props {
  meeting: {
    id: string | number;
    title?: string;
    time?: string;
    duration?: string;
  };
}

const MeetingCard = ({ meeting }: Props) => {
  return (
    <div className="bg-[#18191c] p-5 rounded-xl border border-gray-700 hover:border-cyan-400 transition">
      
      <h3 className="font-semibold text-lg">
        {meeting.title || "Meeting"}
      </h3>

      <p className="text-gray-400 text-sm mt-1">
        {meeting.time || "Time unavailable"} • {meeting.duration || "—"}
      </p>

    </div>
  );
};

export default MeetingCard;