import express from "express";
import { getComplaints, createComplaint } from "../controllers/complaintController.js";
const router = express.Router();

router.route("/").get(getComplaints).post(createComplaint);

export default router;
