import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ScheduledMeeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  reminder: boolean;
  reminderMinutes: number;
}

export interface MeetingHistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  code: string;
  type: "hosted" | "joined";
}

interface MeetingContextType {
  scheduledMeetings: ScheduledMeeting[];
  history: MeetingHistoryItem[];
  activeMeetingCode: string | null;
  addScheduledMeeting: (meeting: ScheduledMeeting) => void;
  addToHistory: (item: MeetingHistoryItem) => void;
  setActiveMeetingCode: (code: string | null) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {

  // 🔹 Load meetings from localStorage
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(() => {
    const stored = localStorage.getItem("scheduledMeetings");
    return stored ? JSON.parse(stored) : [];
  });

  const [history, setHistory] = useState<MeetingHistoryItem[]>(() => {
    const stored = localStorage.getItem("meetingHistory");
    return stored ? JSON.parse(stored) : [];
  });

  const [activeMeetingCode, setActiveMeetingCode] = useState<string | null>(() => {
    return localStorage.getItem("activeMeetingCode");
  });

  // 🔹 Save meetings automatically
  useEffect(() => {
    localStorage.setItem("scheduledMeetings", JSON.stringify(scheduledMeetings));
  }, [scheduledMeetings]);

  useEffect(() => {
    localStorage.setItem("meetingHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (activeMeetingCode) {
      localStorage.setItem("activeMeetingCode", activeMeetingCode);
    } else {
      localStorage.removeItem("activeMeetingCode");
    }
  }, [activeMeetingCode]);

  const addScheduledMeeting = (meeting: ScheduledMeeting) => {
    setScheduledMeetings((prev) => [...prev, meeting]);
  };

  const addToHistory = (item: MeetingHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };


  return (
    <MeetingContext.Provider
      value={{
        scheduledMeetings,
        history,
        activeMeetingCode,
        addScheduledMeeting,
        addToHistory,
        setActiveMeetingCode,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error("useMeetings must be used inside MeetingProvider");
  return context;
};