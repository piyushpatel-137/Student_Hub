import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {axiosInstance} from "../api/axiosInstance";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });
  const { toast } = useToast();

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("v1/complaints");
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit new complaint
  const submitComplaint = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const complaintData = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        studentId: "user123", // Replace with actual user ID from auth context
      };

      const response = await axiosInstance.post("v1/complaints", complaintData);
      const newComplaint = response.data;
      
      // Update local state by adding new complaint at the beginning
      setComplaints(prev => [newComplaint, ...prev]);
      
      // Reset form
      setFormData({
        title: "",
        category: "",
        description: "",
      });

      toast({
        title: "Success",
        description: "Complaint submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format date relative to now
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
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch (error) {
      return "Recently";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "destructive";
      case "In Progress": return "default";
      case "Resolved": return "secondary";
      default: return "default";
    }
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Complaints</h1>
        <p className="text-muted-foreground">Report issues and track their status</p>
      </div>

      <Tabs defaultValue="view" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Complaints</TabsTrigger>
          <TabsTrigger value="file">File Complaint</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No complaints found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <Card key={complaint._id} className="p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-card-foreground">{complaint.title}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground capitalize">
                            {complaint.category}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {complaint.createdAt ? formatRelativeTime(complaint.createdAt) : "Recently"}
                          </div>
                        </div>
                        {complaint.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {complaint.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card className="p-6">
            <form onSubmit={submitComplaint} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Complaint Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your complaint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="it">IT & Technology</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your complaint in detail..."
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Complaints;