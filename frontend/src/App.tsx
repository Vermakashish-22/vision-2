import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MeetingProvider } from "./context/MeetingContext";
import FaceLoginPage from "./pages/FaceLoginPage";
import Dashboard from "./pages/dashboard";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingHistoryPage from "./pages/MeetingHistoryPage";
import NotFound from "./pages/NotFound";
import Signup from "./pages/signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MeetingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<FaceLoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meeting-room" element={<MeetingRoom />} />
            <Route path="/meeting/:code" element={<MeetingRoom />} />
            <Route path="/history" element={<MeetingHistoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MeetingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
