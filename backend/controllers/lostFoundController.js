import LostFound from "../models/LostFound.js";

export const getLostFoundItems = async (req, res) => {
  try {
    const items = await LostFound.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLostFoundItem = async (req, res) => {
  try {
    const item = new LostFound(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
