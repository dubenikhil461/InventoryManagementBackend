import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  location: String, // WH/Stock1
  onHand: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
}, { timestamps: true });

export const Stock = mongoose.model("Stock", StockSchema);
