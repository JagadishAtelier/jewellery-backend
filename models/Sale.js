import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["completed", "refunded"], default: "completed" },
  paymentMethod: { type: String },
  purchasedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Sale", saleSchema);
