import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import GoldRate from './models/GoldRate.js';
import SilverRate from './models/SilverRate.js';
import PlatinumRate from './models/PlatinumRate.js';

dotenv.config();

const TOLA_IN_GRAMS = 8.0;
const KARAT_KEYS = {
  "24K": 'price_gram_24k',
  "22K": 'price_gram_22k',
  "18K": 'price_gram_18k',
};

async function fetchAndStoreRates(apiUrl, apiKey, materialType, model) {
  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    for (const [karat, key] of Object.entries(KARAT_KEYS)) {
      const ratePerGram = data[key];

      if (!ratePerGram || isNaN(ratePerGram)) continue;

      const ratePerPoun = ratePerGram * TOLA_IN_GRAMS;

      const newRate = {
        material: materialType.toLowerCase(), // gold, silver, platinum
        karat: karat.toLowerCase(),
        ratePerGram: ratePerGram.toFixed(3),
        ratePerPoun: ratePerPoun.toFixed(3),
        updatedAt: new Date(),
      };

      await model.create(newRate);
    }

    console.log(`✅ ${materialType} rates updated successfully`);
  } catch (error) {
    console.error(`❌ ${materialType} rate update failed:`, error.message);
    console.error('❌ Detailed Error:', error);
  }
}

async function autoUpdateAllRates() {
  await fetchAndStoreRates(process.env.GOLD_API_URL, process.env.GOLD_API_KEY, 'Gold', GoldRate);
  await fetchAndStoreRates(process.env.SILVER_API_URL, process.env.SILVER_API_KEY, 'Silver', SilverRate);
  await fetchAndStoreRates(process.env.PLATINUM_API_URL, process.env.PLATINUM_API_KEY, 'Platinum', PlatinumRate);
}

// Schedule once daily at 8:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('⏰ Running daily gold, silver, and platinum rate updates...');
  autoUpdateAllRates();
});
