import cron from 'node-cron';
import axios from 'axios';
import GoldRate from './models/GoldRate.js';
import dotenv from 'dotenv';
dotenv.config();

const TOLA_IN_GRAMS = 8.0;
const KARAT_KEYS = {
  "24K": 'price_gram_24k',
  "22K": 'price_gram_22k',
  "18K": 'price_gram_18k',
};

export async function autoUpdateGoldRates() {
  try {
    // Fetch gold rates from the external API
    const { data } = await axios.get(process.env.GOLD_API_URL, {
      headers: {
        'x-access-token': process.env.GOLD_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    // Loop through the KARAT_KEYS to update rates
    for (const [karat, key] of Object.entries(KARAT_KEYS)) {
      const ratePerGram = data[key];

      if (!ratePerGram || isNaN(ratePerGram)) {
        continue; // Skip this iteration if the rate is invalid or missing
      }

      const ratePerPoun = ratePerGram * TOLA_IN_GRAMS;

      const newRate = {
        karat: karat.toLowerCase(),  // Ensure karat is included for each new document
        ratePerGram: ratePerGram.toFixed(3),
        ratePerPoun: ratePerPoun.toFixed(3),
        updatedAt: new Date(),
      };

      // Insert a new record for each update, not just update an existing one
      const result = await GoldRate.create(newRate);  // Create a new document
    }

  } catch (error) {
    console.error('❌ Gold rate update failed:', error.message);
    // Optional: Log more detailed info for debugging
    console.error('❌ Detailed Error:', error);
  }
}

// Schedule the cron job to run every hour
cron.schedule('0 * * * *', autoUpdateGoldRates);
