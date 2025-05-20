import express from 'express';
import {
  getSilverRates,
  updateSilverRate,
  getSilverRateHistory,
  getSilverRatesTrends,
} from '../controllers/silverRateController.js'; // adjust path as needed

const router = express.Router();

// GET /api/silver-rates - Get latest silver rates
router.get('/', getSilverRates);

// PUT /api/silver-rates - Update or insert a silver rate
router.put('/', updateSilverRate);

// GET /api/silver-rates/history/:karat - Get 7-day historical silver rates by karat
router.get('/history/:karat', getSilverRateHistory);

// GET /api/silver-rates/trends - Get trends of silver rates (past 7 days)
router.get('/trends', getSilverRatesTrends);

export default router;
