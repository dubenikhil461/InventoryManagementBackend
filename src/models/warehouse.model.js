import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // WH
  name: { type: String, required: true },
  address: { type: String },

  createdBy: { type: String, ref: "User" },
}, { timestamps: true });

export const Warehouse = mongoose.model("Warehouse", WarehouseSchema);
