import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { axiosInstance } from "../api/axiosInstance";

const Leave = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    reason: "",
    contact: "",
  });
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitLeaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.leaveType || !formData.reason.trim() || !fromDate || !toDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (fromDate > toDate) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const leaveData = {
        studentId: "user123", // Replace with actual user ID from auth context
        leaveType: formData.leaveType,
        reason: formData.reason.trim(),
        contact: formData.contact.trim(),
        startDate: fromDate,
        endDate: toDate,
        status: "Pending"
      };

      const response = await axiosInstance.post("v3/leaves", leaveData);
      
      // Reset form on success
      setFormData({
        leaveType: "",
        reason: "",
        contact: "",
      });
      setFromDate(undefined);
      setToDate(undefined);

      toast({
        title: "Success",
        description: "Leave application submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit leave application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalDays = () => {
    if (!fromDate || !toDate) return 0;
    const timeDiff = toDate.getTime() - fromDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Leave Application</h1>
        <p className="text-muted-foreground">Submit your leave request</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submitLeaveApplication} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select 
              value={formData.leaveType} 
              onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>From Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    disabled={(date) => date < (fromDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide detailed reason..."
              className="min-h-[150px]"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Emergency Contact</Label>
            <Input
              id="contact"
              placeholder="Phone number or email"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold text-card-foreground">Application Summary</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Leave Type: {formData.leaveType ? formData.leaveType.charAt(0).toUpperCase() + formData.leaveType.slice(1) + " Leave" : "Not selected"}</p>
              <p>Duration: {fromDate && toDate ? `${format(fromDate, "PP")} to ${format(toDate, "PP")}` : "Not selected"}</p>
              <p>Total Days: {calculateTotalDays()}</p>
              <p>Status: Pending</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Leave;