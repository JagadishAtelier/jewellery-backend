import express from 'express';
import dayjs from 'dayjs';
import GoldRate from '../models/GoldRate.js';
import SilverRate from '../models/SilverRate.js';
import PlatinumRate from '../models/PlatinumRate.js';

const router = express.Router();

// Utility: Get the latest 3 entries
const getLatestRates = async (Model) => {
  const rates = await Model.find().sort({ updatedAt: -1 }).limit(3);
  return rates.map(rate => ({
    karat: rate.karat,
    ratePerGram: rate.ratePerGram,
    ratePerPoun: rate.ratePerPoun,
    updatedAt: rate.updatedAt,
  }));
};

// Utility: Get trend data (last 7 days grouped by date and hour)
const getTrendData = async (Model) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const rates = await Model.find({
    updatedAt: { $gte: sevenDaysAgo }
  }).sort({ updatedAt: 1 });

  const groupedData = {};

  for (const rate of rates) {
    const date = dayjs(rate.updatedAt).format('DD-MM-YYYY');
    const hour = dayjs(rate.updatedAt).format('HH:00');

    if (!groupedData[date]) {
      groupedData[date] = {
        date,
        rates: [],
        "18k": null,
        "22k": null,
        "24k": null
      };
    }

    groupedData[date].rates.push({ hour, karat: rate.karat, rate: rate.ratePerGram });

    if (!groupedData[date][rate.karat]) {
      groupedData[date][rate.karat] = {
        ratePerGram: rate.ratePerGram,
        ratePerPoun: rate.ratePerPoun,
      };
    }
  }

  return Object.values(groupedData).map(day => ({
    ...day,
    rates: day.rates.reduce((acc, { hour, karat, rate }) => {
      if (!acc[hour]) acc[hour] = {};
      acc[hour][karat] = rate;
      return acc;
    }, {})
  }));
};

// Endpoint: Get latest rates for all metals
router.get('/api/rates/all', async (req, res, next) => {
  try {
    const [gold, silver, platinum] = await Promise.all([
      getLatestRates(GoldRate),
      getLatestRates(SilverRate),
      getLatestRates(PlatinumRate)
    ]);

    res.json({ gold, silver, platinum });
  } catch (err) {
    next(err);
  }
});

// ✅ New Endpoint: Get trend data for all metals
router.get('/api/rates/all-trends', async (req, res, next) => {
  try {
    const [goldTrends, silverTrends, platinumTrends] = await Promise.all([
      getTrendData(GoldRate),
      getTrendData(SilverRate),
      getTrendData(PlatinumRate)
    ]);

    res.json({
      gold: goldTrends,
      silver: silverTrends,
      platinum: platinumTrends
    });
  } catch (err) {
    next(err);
  }
});

export default router;
