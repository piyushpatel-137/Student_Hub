


import express from "express";
import { getLostFoundItems, createLostFoundItem } from "../controllers/lostFoundController.js";
const router = express.Router();

router.route("/").get(getLostFoundItems).post(createLostFoundItem);

export default router;