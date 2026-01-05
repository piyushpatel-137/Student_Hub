import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveApplication", leaveSchema);
