import express from 'express';
import { getGoldRateHistory, getGoldRates, updateGoldRate, getGoldRatesTrends } from '../controllers/goldRateController.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GoldRates
 *   description: Gold rate management
 */

/**
 * @swagger
 * /api/gold-rates:
 *   get:
 *     summary: Get current gold rates for all karats
 *     tags: [GoldRates]
 *     responses:
 *       200:
 *         description: List of gold rates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoldRate'
 */
router.get('/', getGoldRates);

/**
 * @swagger
 * /api/gold-rates:
 *   post:
 *     summary: Set or update the gold rate for a karat
 *     tags: [GoldRates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - karat
 *               - ratePerGram
 *             properties:
 *               karat:
 *                 type: string
 *                 enum: [24k, 22k, 18k]
 *               ratePerGram:
 *                 type: number
 *                 example: 6000.00
 *     responses:
 *       200:
 *         description: Gold rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoldRate'
 *       400:
 *         description: Invalid input or missing data
 */
router.post('/', updateGoldRate);

/**
 * @swagger
 * /api/gold-rates/history/{karat}:
 *   get:
 *     summary: Get one daily snapshot of historical rates for the last 7 days
 *     tags: [GoldRates]
 *     parameters:
 *       - in: path
 *         name: karat
 *         required: true
 *         schema:
 *           type: string
 *           enum: [24k, 22k, 18k]
 *         description: Karat type (e.g. “24k”)
 *       - in: query
 *         name: scheduledTime
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^(?:[01]\d|2[0-3]):[0-5]\d$'
 *           default: '13:00'
 *         description: |
 *           Daily target update time (HH:mm); defaults to 13:00.
 *           The endpoint will pick one record per day as follows:
 *             • If there is a record with `updatedAt` ≤ (scheduledTime + 30 min),  
 *               it returns the record **closest** to that cutoff.  
 *             • Otherwise, it returns the **earliest** record **after** (scheduledTime + 30 min).
 *     responses:
 *       200:
 *         description: Array of up to 7 daily snapshots for the requested karat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoldRate'
 *       400:
 *         description: Invalid karat or scheduledTime format
 *       404:
 *         description: No historical snapshots found for the given karat
 */
router.get('/trends', getGoldRatesTrends);


export default router;
