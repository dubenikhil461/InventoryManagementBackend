import mongoose from "mongoose";

const DeliveryItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: "pcs" }
});

const DeliverySchema = new mongoose.Schema({
  warehouseId: { type: String, required: true },
  operation: { type: String, enum: ["OUT"], default: "OUT" },

  autoIncrementId: { type: Number, default: 1 },

  reference: { type: String, unique: true },

  deliverTo: String,
  responsible: { type: String, ref: "User" },
  scheduleDate: Date,

  status: {
    type: String,
    enum: ["Draft", "Ready", "Done", "Cancelled"],
    default: "Draft"
  },

  items: [DeliveryItemSchema],

  createdBy: { type: String, ref: "User" },
  validatedBy: { type: String, ref: "User" },

}, { timestamps: true });

DeliverySchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const last = await this.constructor.findOne({}).sort({ autoIncrementId: -1 });
  this.autoIncrementId = last ? last.autoIncrementId + 1 : 1;

  const formatted = String(this.autoIncrementId).padStart(4, "0");
  this.reference = `${this.warehouseId}/OUT/${formatted}`;

  next();
});

export const Delivery = mongoose.model("Delivery", DeliverySchema);
