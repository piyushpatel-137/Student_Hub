import LeaveApplication from "../models/LeaveApplication.js";

export const getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.find();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLeave = async (req, res) => {
  try {
    const leave = new LeaveApplication(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
