import mongoose from "mongoose";

const abandonedCartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional for guests
  sessionId: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    }
  ],
  location: {
    ip: String,
    city: String,
    region: String,
    country: String,
    lat: Number,
    lon: Number,
  },
  lastUpdated: { type: Date, default: Date.now },
  isRecovered: { type: Boolean, default: false }
});

export default mongoose.model("AbandonedCart", abandonedCartSchema);
