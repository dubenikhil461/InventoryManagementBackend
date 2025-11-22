import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  code: { type: String, required: true }, // WH/Stock1
  name: { type: String },

  createdBy: { type: String, ref: "User" },
}, { timestamps: true });

export const Location = mongoose.model("Location", LocationSchema);
