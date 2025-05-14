import Sale from "../models/Sale.js";
import AbandonedCart from "../models/AbandonedCart.js";

// Save a new sale
export const createSale = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Failed to record sale", details: err });
  }
};

// Save/update abandoned cart
export const saveAbandonedCart = async (req, res) => {
  const { sessionId, user, items, location } = req.body;
  try {
    const updated = await AbandonedCart.findOneAndUpdate(
      { sessionId },
      {
        user,
        items,
        location,
        lastUpdated: Date.now()
      },
      { upsert: true, new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to save abandoned cart", details: err });
  }
};

// Get analytics including user info
export const getAnalytics = async (req, res) => {
  try {
    const salesCount = await Sale.countDocuments();
    const abandonedCount = await AbandonedCart.countDocuments();

    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(10);

    const recentAbandoned = await AbandonedCart.find()
      .sort({ lastUpdated: -1 })
      .limit(10)
      .populate("items.product") // Get product info
      .populate("user", "name phone"); // Only fetch name and phone

    res.json({ salesCount, abandonedCount, recentSales, recentAbandoned });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics", details: err });
  }
};
