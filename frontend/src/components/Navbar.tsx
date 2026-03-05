import { Search, Settings, History } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/userContext";
import { useMeetings } from "@/context/MeetingContext";

const Navbar = () => {
    const { user } = useUser();
    const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const meetingsContext = useMeetings();
  const scheduledMeetings = meetingsContext.scheduledMeetings;
  
  const filteredMeetings = scheduledMeetings.filter((meeting: any) => {
  const term = search.toLowerCase();

  return (
    meeting.title.toLowerCase().includes(term) ||
    (meeting.code && meeting.code.toLowerCase().includes(term))
  );
});

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500/20 p-2 rounded-lg">
          <History className="text-cyan-400 w-5 h-5" />
        </div>

        <span className="text-xl font-bold text-white">
          Face<span className="text-cyan-400">Meet</span>
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Search meetings, codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl bg-[#18191c] border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        <Settings className="text-gray-400 cursor-pointer hover:text-white" />

        {/* Profile */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full border border-cyan-400 overflow-hidden cursor-pointer"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-cyan-500/20 w-full h-full flex items-center justify-center text-cyan-400 font-semibold">
                {initials}
              </div>
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 bg-[#0f172a] border border-gray-700 rounded-lg p-4 w-48 shadow-xl">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-semibold text-white mb-3">{user?.name || "User"}</p>

              <button className="w-full text-left text-sm hover:text-cyan-400">
                Profile
              </button>

              <button className="w-full text-left text-sm hover:text-cyan-400 mt-2">
                Settings
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("userName");
                  window.location.href = "/";
                }}
                className="w-full text-left text-sm text-red-400 mt-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;