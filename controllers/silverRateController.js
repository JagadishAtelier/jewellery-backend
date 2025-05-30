import SilverRate from '../models/SilverRate.js';
import dayjs from 'dayjs';

const TOLA_IN_GRAMS = 8.0;

export const getSilverRates = async (req, res, next) => {
  try {
    const rates = await SilverRate.find().sort({ updatedAt: -1 }).limit(3);
    if (!rates.length) return res.status(404).json({ message: 'No silver rates available' });

    res.json(rates.map(rate => ({
      karat: rate.karat,
      ratePerGram: rate.ratePerGram,
      ratePerPoun: rate.ratePerPoun,
      updatedAt: rate.updatedAt,
    })));
  } catch (err) {
    next(err);
  }
};

export const updateSilverRate = async (req, res, next) => {
  try {
    const { karat, ratePerGram } = req.body;

    const validKarats = ['18k', '22k', '24k'];
    if (!karat || !ratePerGram)
      return res.status(400).json({ message: 'karat and ratePerGram are required' });

    if (!validKarats.includes(karat))
      return res.status(400).json({ message: `Invalid karat. Only ${validKarats.join(', ')} allowed.` });

    const ratePerPoun = ratePerGram * TOLA_IN_GRAMS;

    // 🔍 Find the most recently created document for this karat
    const latestDoc = await SilverRate.findOne({ karat }).sort({ createdAt: -1 });

    if (!latestDoc) {
      return res.status(404).json({ message: `No existing ${karat} record found to update.` });
    }

    latestDoc.ratePerGram = ratePerGram;
    latestDoc.ratePerPoun = ratePerPoun;

    const updated = await latestDoc.save();

    res.json(updated);
  } catch (err) {
    next(err);
  }
};


export const getSilverRateHistory = async (req, res, next) => {
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

      const dayRecords = await SilverRate.find({
        karat,
        updatedAt: { $gte: day, $lt: nextDay }
      }).sort({ updatedAt: 1 }).lean();

      if (!dayRecords.length) continue;

      const beforeOrEqual = dayRecords.filter(r => new Date(r.updatedAt) <= cutoffWithGrace);
      const chosen = beforeOrEqual.length ? beforeOrEqual[beforeOrEqual.length - 1]
                                          : dayRecords.find(r => new Date(r.updatedAt) > cutoffWithGrace);

      if (chosen) {
        results.push({
          karat: chosen.karat,
          ratePerGram: chosen.ratePerGram,
          ratePerPoun: chosen.ratePerPoun,
          updatedAt: chosen.updatedAt
        });
      }
    }

    if (!results.length) return res.status(404).json({ message: 'No historical silver rates found' });

    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const getSilverRatesTrends = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const rates = await SilverRate.find({
      updatedAt: { $gte: sevenDaysAgo }
    }).sort({ updatedAt: 1 });

    if (!rates.length) return res.status(404).json({ message: 'No silver rate data found' });

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
