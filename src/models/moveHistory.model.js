import mongoose from "mongoose";

const MoveHistorySchema = new mongoose.Schema({
  reference: { type: String, required: true },

  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,

  source: String,
  destination: String,

  movementType: { type: String, enum: ["IN", "OUT"] },

  performedBy: { type: String, ref: "User" },

}, { timestamps: true });

export const MoveHistory = mongoose.model("MoveHistory", MoveHistorySchema);
