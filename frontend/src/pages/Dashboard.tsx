import { useState, useEffect } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { Search, AlertCircle, Calendar, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { axiosInstance } from "../api/axiosInstance";

const Dashboard = () => {
  const [stats, setStats] = useState({
    lostItems: 0,
    activeComplaints: 0,
    upcomingEvents: 0,
    leaveApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [complaintsRes, lostFoundRes, eventsRes, leavesRes, dashboardRes] = await Promise.all([
        axiosInstance.get("v1/complaints"),
        axiosInstance.get("v2/lostfound"),
        axiosInstance.get("v3/events"),
        axiosInstance.get("v3/leaves"),
        axiosInstance.get("v3/dashboard") // Your existing dashboard stats endpoint
      ]);

      const complaints = complaintsRes.data || [];
      const lostFound = lostFoundRes.data || [];
      const events = eventsRes.data || [];
      const leaves = leavesRes.data || [];
      const dashboardStats = dashboardRes.data || {};

      // Calculate stats
      setStats({
        lostItems: dashboardStats.lostFound || lostFound.length,
        activeComplaints: dashboardStats.complaints || complaints.filter(c => c.status === "Pending").length,
        upcomingEvents: dashboardStats.events || events.filter(e => new Date(e.date) > new Date()).length,
        leaveApplications: dashboardStats.leaves || leaves.filter(l => l.status === "Pending").length
      });

      // Generate recent activities
      const activities = generateRecentActivities(complaints, lostFound, events, leaves);
      setRecentActivities(activities);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate recent activities from all data
  const generateRecentActivities = (complaints, lostFound, events, leaves) => {
    const activities = [];

    // Add recent lost items (last 3)
    lostFound.slice(0, 3).forEach(item => {
      activities.push({
        type: "lost_item",
        title: "New lost item reported",
        description: `${item.itemName} - ${item.location}`,
        timestamp: item.createdAt,
        color: "primary"
      });
    });

    // Add upcoming events (next 2)
    const upcomingEvents = events
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 2);

    upcomingEvents.forEach(event => {
      activities.push({
        type: "event",
        title: "Upcoming event",
        description: `${event.title} - ${new Date(event.date).toLocaleDateString()}`,
        timestamp: event.date,
        color: "secondary"
      });
    });

    // Add recent complaints (last 2)
    complaints.slice(0, 2).forEach(complaint => {
      activities.push({
        type: "complaint",
        title: "New complaint filed",
        description: complaint.title,
        timestamp: complaint.createdAt,
        color: "accent"
      });
    });

    // Add recent leave applications (last 2)
    leaves.slice(0, 2).forEach(leave => {
      activities.push({
        type: "leave",
        title: "Leave application submitted",
        description: `${leave.leaveType} leave - ${new Date(leave.startDate).toLocaleDateString()}`,
        timestamp: leave.createdAt,
        color: "accent"
      });
    });

    // Sort by timestamp and return top 5
    return activities
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 5);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = +now - +date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInDays === 1) return "1 day ago";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return `${Math.floor(diffInDays / 7)} weeks ago`;
    } catch (error) {
      return "Recently";
    }
  };

  // Get color class based on activity type
  const getActivityColor = (color) => {
    switch (color) {
      case "primary": return "bg-primary";
      case "secondary": return "bg-secondary";
      case "accent": return "bg-accent";
      default: return "bg-primary";
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "report_lost_item":
        window.location.href = "/lost-found?tab=report";
        break;
      case "file_complaint":
        window.location.href = "/complaints?tab=file";
        break;
      case "apply_leave":
        window.location.href = "/leave";
        break;
      default:
        break;
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dashboardStats = [
    { title: "Lost Items", count: stats.lostItems, icon: Search },
    { title: "Active Complaints", count: stats.activeComplaints, icon: AlertCircle },
    { title: "Upcoming Events", count: stats.upcomingEvents, icon: Calendar },
    { title: "Leave Applications", count: stats.leaveApplications, icon: FileText },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's what's happening in your campus today</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-card-foreground">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activities</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${getActivityColor(activity.color)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-card-foreground">Quick Actions</h2>
          <div className="grid gap-3">
            <button 
              onClick={() => handleQuickAction("report_lost_item")}
              className="flex items-center gap-3 rounded-lg bg-primary p-4 text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Search className="h-5 w-5" />
              <span className="font-medium">Report Lost Item</span>
            </button>
            <button 
              onClick={() => handleQuickAction("file_complaint")}
              className="flex items-center gap-3 rounded-lg bg-secondary p-4 text-secondary-foreground transition-all hover:bg-secondary/90 hover:shadow-md"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">File Complaint</span>
            </button>
            <button 
              onClick={() => handleQuickAction("apply_leave")}
              className="flex items-center gap-3 rounded-lg bg-accent p-4 text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-md"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;