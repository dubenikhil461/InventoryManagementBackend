import express from "express";
import { MoveHistory } from "../models/moveHistory.model.js";

const router = express.Router();

/**
 * List all move history
 */
router.get("/", async (req, res) => {
  try {
    const list = await MoveHistory.find()
      .populate("productId")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
