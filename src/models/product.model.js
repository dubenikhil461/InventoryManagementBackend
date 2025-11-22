import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  // e.g. DESK001
  name: { type: String, required: true },
  category: { type: String },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },

  createdBy: { type: String, ref: "User" },
  updatedBy: { type: String, ref: "User" },

}, { timestamps: true });

export const Product = mongoose.model("Product", ProductSchema);
