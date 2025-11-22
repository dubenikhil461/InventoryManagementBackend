import express from "express";
import { Delivery } from "../models/delivery.model.js";
import { Stock } from "../models/stock.model.js";
import { MoveHistory } from "../models/moveHistory.model.js";
import { getUserSession } from "../utils/session.js";

const router = express.Router();

/**
 * Create Delivery (Draft)
 */
router.post("/", async (req, res) => {
  try {
    const user = await getUserSession(req, res);

    const delivery = new Delivery({
      ...req.body,
      createdBy: user.id,
      responsible: user.id,
    });

    const saved = await delivery.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all Deliveries
 */
router.get("/", async (req, res) => {
  try {
    const list = await Delivery.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Delivery by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("items.productId");
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update Delivery (Draft only)
 */
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
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
    const { action } = req.body;

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: "Not found" });

    if (action === "TODO" && delivery.status === "Draft") {
      delivery.status = "Ready";
    }

    if (action === "VALIDATE" && delivery.status === "Ready") {
      delivery.status = "Done";
      delivery.validatedBy = user.id;

      // AUTO STOCK DEDUCTION + MOVE HISTORY
      for (const item of delivery.items) {
        const stock = await Stock.findOne({
          productId: item.productId,
          location: delivery.from,
        });

        if (!stock || stock.onHand < item.quantity) {
          return res.status(400).json({ error: "Not enough stock" });
        }

        stock.onHand -= item.quantity;
        stock.available -= item.quantity;
        await stock.save();

        await MoveHistory.create({
          reference: delivery.reference,
          productId: item.productId,
          quantity: item.quantity,
          movementType: "OUT",
          source: delivery.from,
          destination: delivery.deliverTo,
          performedBy: user.id,
        });
      }
    }

    if (action === "CANCEL") {
      delivery.status = "Cancelled";
    }

    await delivery.save();
    res.json({ updatedStatus: delivery.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
