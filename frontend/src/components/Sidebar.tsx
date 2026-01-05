import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  AlertCircle, 
  Calendar, 
  FileText,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/lost-found", icon: Search, label: "Lost & Found" },
  { to: "/complaints", icon: AlertCircle, label: "Complaints" },
  { to: "/events", icon: Calendar, label: "Events" },
  { to: "/leave", icon: FileText, label: "Leave Application" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary to-secondary p-6 text-primary-foreground shadow-lg">
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-8 w-8" />
        <h1 className="text-xl font-bold">StudentHub</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                "hover:bg-white/10",
                isActive && "bg-white/20 shadow-md"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
