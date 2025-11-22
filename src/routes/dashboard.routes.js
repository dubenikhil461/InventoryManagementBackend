import express from "express";
import { Receipt } from "../models/receipt.model.js";
import { Delivery } from "../models/delivery.model.js";
import { MoveHistory } from "../models/moveHistory.model.js";
import { Stock } from "../models/stock.model.js";

const router = express.Router();

// Get stats for dashboard
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Today's Receipts
    const todayReceipts = await Receipt.countDocuments({
      createdAt: { $gte: today }
    });

    // 2️⃣ Today's Deliveries
    const todayDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: today }
    });

    // 3️⃣ Monthly Stock In
    const monthlyStockIn = await Receipt.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: { $sum: "$items.quantity" } }
        }
      }
    ]);

    // 4️⃣ Monthly Stock Out
    const monthlyStockOut = await Delivery.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: { $sum: "$items.quantity" } }
        }
      }
    ]);

    // 5️⃣ Top Products Moved
    const topProducts = await MoveHistory.aggregate([
      {
        $group: {
          _id: "$productId",
          qty: { $sum: "$quantity" }
        }
      },
      { $sort: { qty: -1 } },
      { $limit: 5 }
    ]);

    // 6️⃣ Low Stock
    const lowStock = await Stock.find({
      available: { $lt: 10 }
    }).populate("productId");

    res.json({
      todayReceipts,
      todayDeliveries,
      monthlyStockIn,
      monthlyStockOut,
      topProducts,
      lowStock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
