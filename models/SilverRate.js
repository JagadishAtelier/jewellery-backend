import mongoose from 'mongoose';

const silverRateSchema = new mongoose.Schema({
  karat: {
    type: String,
    enum: ['24k', '22k', '18k'],
    required: true,
    lowercase: true,
  },
  ratePerGram: {
    type: Number,
    required: true,
  },
  ratePerPoun: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

silverRateSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);
const SilverRate = mongoose.model('SilverRate', silverRateSchema);

export default SilverRate;
