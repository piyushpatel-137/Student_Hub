import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    description: String,
    location: String,
    status: { type: String, default: "Lost" }
  },
  { timestamps: true }
);

export default mongoose.model("LostFound", lostFoundSchema);
