import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LostFound from "./pages/LostFound";
import Complaints from "./pages/Complaints";
import Events from "./pages/Events";
import Leave from "./pages/Leave";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar />
          <main className="ml-64 flex-1 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/events" element={<Events />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
