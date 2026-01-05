import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { axiosInstance } from "../api/axiosInstance";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const { toast } = useToast();

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("v3/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date || !formData.location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const eventData = {
        title: formData.title.trim(),
        date: formData.date,
        location: formData.location.trim(),
        description: formData.description.trim(),
        createdBy: "user123", // Replace with actual user ID from auth context
        attendees: 0, // Default attendees count
        type: "General" // You might want to add a type field to your form
      };

      const response = await axiosInstance.post("v3/events", eventData);
      const newEvent = response.data;
      
      // Update local state by adding new event at the beginning
      setEvents(prev => [newEvent, ...prev]);
      
      // Reset form
      setFormData({
        title: "",
        date: "",
        location: "",
        description: "",
      });

      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format datetime-local input value
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return "";
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Events & Fests</h1>
        <p className="text-muted-foreground">Discover and create campus events</p>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Events</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <Card key={event._id || event.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-card-foreground">{event.title}</h3>
                      <Badge>{event.type || "Event"}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location || "Location not specified"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.attendees || 0} attendees
                      </div>
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <Button className="mt-4 w-full" variant="outline">
                      Register
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-6">
            <form onSubmit={createEvent} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Event Title *</Label>
                  <Input
                    id="eventTitle"
                    placeholder="e.g., Tech Symposium"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date & Time *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventLocation">Location *</Label>
                <Input
                  id="eventLocation"
                  placeholder="Venue details"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDescription">Event Description</Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Describe your event..."
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating Event..." : "Create Event"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;