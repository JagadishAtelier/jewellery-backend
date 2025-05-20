import PlatinumRate from '../models/PlatinumRate.js';
import dayjs from 'dayjs';

const TOLA_IN_GRAMS = 8.0;

// Get latest platinum rates (most recent 3 updates per karat)
export const getPlatinumRates = async (req, res, next) => {
  try {
    const rates = await PlatinumRate.find().sort({ updatedAt: -1 }).limit(3);
    if (!rates.length) return res.status(404).json({ message: 'No platinum rates available' });

    res.json(
      rates.map(rate => ({
        karat: rate.karat,
        ratePerGram: rate.ratePerGram,
        ratePerPoun: rate.ratePerPoun,
        updatedAt: rate.updatedAt,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Update or insert platinum rate by karat
export const updatePlatinumRate = async (req, res, next) => {
  try {
    const { karat, ratePerGram } = req.body;
    if (!karat || !ratePerGram) return res.status(400).json({ message: 'karat and ratePerGram are required' });

    const ratePerPoun = ratePerGram * TOLA_IN_GRAMS;

    const updated = await PlatinumRate.findOneAndUpdate(
      { karat },
      { ratePerGram, ratePerPoun },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Get historical platinum rates for the last 7 days per karat
export const getPlatinumRateHistory = async (req, res, next) => {
  try {
    const { karat } = req.params;
    const scheduledTime = req.query.scheduledTime || '13:00';
    const [schHour, schMin] = scheduledTime.split(':').map(Number);
    const graceMs = 30 * 60 * 1000;

    const today = new Date();
    const results = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const cutoff = new Date(day);
      cutoff.setHours(schHour, schMin, 0, 0);
      const cutoffWithGrace = new Date(cutoff.getTime() + graceMs);

      const dayRecords = await PlatinumRate.find({
        karat,
        updatedAt: { $gte: day, $lt: nextDay }
      }).sort({ updatedAt: 1 }).lean();

      if (!dayRecords.length) continue;

      const beforeOrEqual = dayRecords.filter(r => new Date(r.updatedAt) <= cutoffWithGrace);
      const chosen = beforeOrEqual.length
        ? beforeOrEqual[beforeOrEqual.length - 1]
        : dayRecords.find(r => new Date(r.updatedAt) > cutoffWithGrace);

      if (chosen) {
        results.push({
          karat: chosen.karat,
          ratePerGram: chosen.ratePerGram,
          ratePerPoun: chosen.ratePerPoun,
          updatedAt: chosen.updatedAt,
        });
      }
    }

    if (!results.length) return res.status(404).json({ message: 'No historical platinum rates found' });

    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Get platinum rate trends grouped by day/hour/karat
export const getPlatinumRatesTrends = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const rates = await PlatinumRate.find({
      updatedAt: { $gte: sevenDaysAgo }
    }).sort({ updatedAt: 1 });

    if (!rates.length) return res.status(404).json({ message: 'No platinum rate data found' });

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
          "24k": null,
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

    const result = Object.values(groupedData).map(day => ({
      ...day,
      rates: day.rates.reduce((acc, { hour, karat, rate }) => {
        if (!acc[hour]) acc[hour] = {};
        acc[hour][karat] = rate;
        return acc;
      }, {})
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};
