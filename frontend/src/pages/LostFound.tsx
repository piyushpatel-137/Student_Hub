import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { axiosInstance } from "../api/axiosInstance";

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    contact: "",
    status: "lost", // Default to lost
  });
  const { toast } = useToast();

  // Fetch lost & found items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("v2/lostfound");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit new lost/found item
  const submitItem = async (e) => {
    e.preventDefault();
    
    if (!formData.itemName.trim() || !formData.location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const itemData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        contact: formData.contact.trim(),
        status: formData.status,
        reportedBy: "user123", // Replace with actual user ID from auth context
      };

      const response = await axiosInstance.post("v2/lostfound", itemData);
      const newItem = response.data;
      
      // Update local state by adding new item at the beginning
      setItems(prev => [newItem, ...prev]);
      
      // Reset form
      setFormData({
        itemName: "",
        description: "",
        location: "",
        contact: "",
        status: "lost",
      });

      toast({
        title: "Success",
        description: "Item reported successfully!",
      });
    } catch (error) {
      console.error("Error reporting item:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to report item",
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

  // Filter items based on search and status
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || item.status?.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Lost & Found</h1>
        <p className="text-muted-foreground">Report or search for lost items</p>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Items</TabsTrigger>
          <TabsTrigger value="report">Report Item</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search items..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {items.length === 0 ? "No items reported yet" : "No items match your search"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item) => (
                  <Card key={item._id} className="p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground">{item.itemName}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {item.location || "Location not specified"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {item.createdAt ? formatRelativeTime(item.createdAt) : "Recently"}
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        {item.contact && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Contact: {item.contact}
                          </p>
                        )}
                      </div>
                      <Badge variant={item.status === "lost" ? "destructive" : "default"}>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Unknown"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card className="p-6">
            <form onSubmit={submitItem} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Blue Backpack"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Item Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="found">Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Where did you lose/find it?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description (color, brand, distinctive features)..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  placeholder="Email or phone number for contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LostFound;