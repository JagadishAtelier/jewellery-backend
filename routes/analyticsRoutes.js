import express from "express";
import {
  createSale,
  saveAbandonedCart,
  getAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics/sale:
 *   post:
 *     summary: Record a new sale
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, products, totalAmount]
 *             properties:
 *               user:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity, priceAtPurchase]
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     priceAtPurchase:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *               status:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale recorded
 *       500:
 *         description: Failed to record sale
 */
router.post("/sale", createSale);

/**
 * @swagger
 * /api/analytics/abandoned:
 *   post:
 *     summary: Save or update an abandoned cart
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, products]
 *             properties:
 *               sessionId:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity]
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               location:
 *                 type: object
 *                 properties:
 *                   ip:
 *                     type: string
 *                   city:
 *                     type: string
 *                   region:
 *                     type: string
 *                   country:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *     responses:
 *       200:
 *         description: Cart saved
 *       500:
 *         description: Save failed
 */
router.post("/abandoned", saveAbandonedCart);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Summary retrieved
 *       500:
 *         description: Failed to fetch summary
 */
router.get("/summary", getAnalytics);

export default router;
