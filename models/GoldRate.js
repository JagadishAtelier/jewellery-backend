import mongoose from 'mongoose';

const goldRateSchema = new mongoose.Schema(
  {
    karat: {
      type: String,
      required: true,
      enum: ['24k', '22k', '18k'],
    },
    ratePerGram: {
      type: Number,
      required: true,
    },
    ratePerPoun: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

goldRateSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

export default mongoose.model('GoldRate', goldRateSchema);
