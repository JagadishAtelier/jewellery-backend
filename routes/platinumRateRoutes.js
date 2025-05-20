import express from 'express';
import {
  getPlatinumRates,
  updatePlatinumRate,
  getPlatinumRateHistory,
  getPlatinumRatesTrends,
} from '../controllers/platinumRateController.js'; // Adjust path as needed

const router = express.Router();

// GET /api/platinum-rates - Get latest platinum rates
router.get('/', getPlatinumRates);

// PUT /api/platinum-rates - Update or insert a platinum rate
router.put('/', updatePlatinumRate);

// GET /api/platinum-rates/history/:karat - Get 7-day historical platinum rates by karat
router.get('/history/:karat', getPlatinumRateHistory);

// GET /api/platinum-rates/trends - Get trends of platinum rates (past 7 days)
router.get('/trends', getPlatinumRatesTrends);

export default router;
