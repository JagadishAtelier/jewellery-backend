import axios from 'axios';
import GoldRate from '../models/GoldRate.js';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();

export const getGoldRates = async (req, res, next) => {
  try {
    const rates = await GoldRate.find().sort({ updatedAt: -1 }).limit(3); // Sort by updatedAt in descending order

    if (rates.length === 0) {
      return res.status(404).json({ message: 'No gold rates available' });
    }

    const formattedRates = rates.map(rate => ({
      karat: rate.karat,
      ratePerGram: rate.ratePerGram,
      ratePerPoun: rate.ratePerPoun,
      updatedAt: rate.updatedAt,
    }));

    res.json(formattedRates);
  } catch (err) {
    next(err);
  }
};

export const updateGoldRate = async (req, res, next) => {
  try {
    const { karat, ratePerGram } = req.body;

    if (!karat || !ratePerGram) {
      return res.status(400).json({ message: 'karat and ratePerGram are required' });
    }

    const ratePerPoun = ratePerGram * 8.0;

    const updated = await GoldRate.findOneAndUpdate(
      { karat },
      { ratePerGram, ratePerPoun },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/gold-rates/history/:karat
 * Query param: scheduledTime (HH:mm, default "13:00")
 *
 * Returns one record per day for the last 7 days:
 *  – If there is a record with updatedAt ≤ scheduledTime + 30min, returns the one
 *    with the largest updatedAt in that window.
 *  – Otherwise returns the earliest record after scheduledTime + 30min.
 */
export const getGoldRateHistory = async (req, res, next) => {
  try {
    const { karat } = req.params;
    const scheduledTime = req.query.scheduledTime || '13:00';

    // Parse scheduledTime into hours and minutes
    const [schHour, schMin] = scheduledTime.split(':').map(Number);
    const graceMs = 30 * 60 * 1000; // 30 minutes

    const today = new Date();
    const results = [];

    for (let i = 0; i < 7; i++) {
      // For each of the last 7 days
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      // Compute the cutoff timestamp for this day: scheduledTime + 30min
      const cutoff = new Date(day);
      cutoff.setHours(schHour, schMin, 0, 0);
      const cutoffWithGrace = new Date(cutoff.getTime() + graceMs);

      // Fetch all records for this karat on that day
      const dayRecords = await GoldRate.find({
        karat,
        updatedAt: { $gte: day, $lt: nextDay }
      }).sort({ updatedAt: 1 }).lean();

      if (!dayRecords.length) {
        // no data that day
        continue;
      }

      // Partition into before-or-equal-to cutoffWithGrace vs after
      const beforeOrEqual = dayRecords.filter(r => new Date(r.updatedAt) <= cutoffWithGrace);
      let chosen;
      if (beforeOrEqual.length) {
        // pick the one closest to cutoff (i.e. max updatedAt)
        chosen = beforeOrEqual[beforeOrEqual.length - 1];
      } else {
        // no record in the grace window → pick earliest after cutoffWithGrace
        chosen = dayRecords.find(r => new Date(r.updatedAt) > cutoffWithGrace);
      }

      if (chosen) {
        results.push({
          karat: chosen.karat,
          ratePerGram: chosen.ratePerGram,
          ratePerPoun: chosen.ratePerPoun,
          updatedAt: chosen.updatedAt
        });
      }
    }

    if (!results.length) {
      return res.status(404).json({ message: 'No historical rates found for this karat.' });
    }

    // Sort results newest-first by date
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(results);
  } catch (err) {
    next(err);
  }
};


export const getGoldRatesTrends = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6); // includes today

    // Fetch last 7 days of data
    const rates = await GoldRate.find({
      updatedAt: { $gte: sevenDaysAgo }
    }).sort({ updatedAt: 1 });

    if (!rates.length) {
      return res.status(404).json({ message: 'No gold rate data found' });
    }

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

      // Add to hourly trend
      groupedData[date].rates.push({
        hour,
        karat: rate.karat,
        rate: rate.ratePerGram
      });

      // Store latest rate for the day by karat
      if (!groupedData[date][rate.karat]) {
        groupedData[date][rate.karat] = {
          ratePerGram: rate.ratePerGram,
          ratePerPoun: rate.ratePerPoun,
        };
      }
    }

    // Transform to array
    const result = Object.values(groupedData).map(day => {
      // Group hourly rates by karat if needed
      return {
        ...day,
        rates: day.rates.reduce((acc, { hour, karat, rate }) => {
          if (!acc[hour]) acc[hour] = {};
          acc[hour][karat] = rate;
          return acc;
        }, {})
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
