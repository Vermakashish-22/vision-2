import { useState } from "react";
import { useMeetings } from "@/context/MeetingContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleMeetingDialog = ({ open, onOpenChange }: Props) => {
  const { addScheduledMeeting } = useMeetings();

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30 min");
  const [reminder, setReminder] = useState(true);

  if (!open) return null;

  const handleSchedule = () => {
    addScheduledMeeting({
      id: crypto.randomUUID(),
      title,
      date: new Date(),
      time,
      duration,
      reminder,
      reminderMinutes: 10
    });

    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#18191c] p-8 rounded-xl w-[450px] text-white">
        <h2 className="text-xl font-bold mb-6">Schedule Meeting</h2>

        <input
          className="w-full p-3 rounded bg-[#1e293b] mb-4"
          placeholder="Meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="time"
          className="w-full p-3 rounded bg-[#1e293b] mb-4"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <select
          className="w-full p-3 rounded bg-[#1e293b] mb-4"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option>15 min</option>
          <option>30 min</option>
          <option>45 min</option>
          <option>60 min</option>
        </select>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={reminder}
            onChange={() => setReminder(!reminder)}
          />
          Enable Reminder
        </label>

        <div className="flex justify-end gap-4">
          <button onClick={() => onOpenChange(false)}>Cancel</button>
          <button
            onClick={handleSchedule}
            className="bg-cyan-500 px-5 py-2 rounded text-black font-semibold"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingDialog;