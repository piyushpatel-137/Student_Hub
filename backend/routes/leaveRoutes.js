import express from "express";
import { getLeaves, createLeave } from "../controllers/leaveController.js";
const router = express.Router();

router.route("/").get(getLeaves).post(createLeave);

export default router;
