import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name:         { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    description:  { type: String, trim: true, maxlength: 200 },
    imageUrl:     { type: String, trim: true },
    bgClass:      { type: String, trim: true },
    heightClass:  { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);