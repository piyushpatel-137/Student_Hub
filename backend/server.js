import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import complaintRoutes from "./routes/complaintRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Management System API is running...");
});

// Versioned APIs
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v2/lostfound", lostFoundRoutes);
app.use("/api/v3/events", eventRoutes);
app.use("/api/v3/leaves", leaveRoutes);

import mongoose from "mongoose";
app.get("/api/v3/dashboard", async (req, res) => {
  try {
    const Complaint = mongoose.model("Complaint");
    const LostFound = mongoose.model("LostFound");
    const Event = mongoose.model("Event");
    const LeaveApplication = mongoose.model("LeaveApplication");

    const stats = {
      complaints: await Complaint.countDocuments(),
      lostFound: await LostFound.countDocuments(),
      events: await Event.countDocuments(),
      leaves: await LeaveApplication.countDocuments(),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
