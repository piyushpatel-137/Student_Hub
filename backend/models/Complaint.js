import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
