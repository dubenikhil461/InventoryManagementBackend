import express from "express";
import { Receipt } from "../models/receipt.model.js";
import { MoveHistory } from "../models/moveHistory.model.js";
import { Stock } from "../models/stock.model.js";
import { getUserSession } from "../utils/session.js";

const router = express.Router();

/**
 * Create Receipt (Draft)
 */
router.post("/", async (req, res) => {
  try {
    const user = await getUserSession(req, res);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const receipt = new Receipt({
      ...req.body,
      createdBy: user.id,
      responsible: user.id,
    });

    const saved = await receipt.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all Receipts
 */
router.get("/", async (req, res) => {
  try {
    const list = await Receipt.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Receipt by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate("items.productId");
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update Receipt Details (Draft only)
 */
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Receipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Status Change: Draft → Ready, Ready → Done
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const user = await getUserSession(req, res);
    const { action } = req.body; // TODO, VALIDATE, CANCEL

    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) return res.status(404).json({ error: "Not found" });

    if (action === "TODO" && receipt.status === "Draft") {
      receipt.status = "Ready";
    }

    if (action === "VALIDATE" && receipt.status === "Ready") {
      receipt.status = "Done";
      receipt.validatedBy = user.id;

      // AUTO UPDATE STOCK + MOVE HISTORY
      for (const item of receipt.items) {
        let stock = await Stock.findOne({
          productId: item.productId,
          location: receipt.to,
        });

        // Create stock if not exists
        if (!stock) {
          stock = new Stock({
            productId: item.productId,
            location: receipt.to,
            onHand: 0,
            available: 0,
          });
        }

        stock.onHand += item.quantity;
        stock.available += item.quantity;
        await stock.save();

        await MoveHistory.create({
          reference: receipt.reference,
          productId: item.productId,
          quantity: item.quantity,
          movementType: "IN",
          source: receipt.receiveFrom || "Vendor",
          destination: receipt.to,
          performedBy: user.id,
        });
      }
    }

    if (action === "CANCEL") {
      receipt.status = "Cancelled";
    }

    await receipt.save();
    res.json({ updatedStatus: receipt.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete Receipt
 */
router.delete("/:id", async (req, res) => {
  try {
    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ message: "Receipt Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
