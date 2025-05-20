import Product from '../models/Product.js';
import GoldRate from '../models/GoldRate.js';

export const addProduct = async (req, res, next) => {
  
  try {
    const {
      name,
      karat,
      shortdiscription,
      productid,
      images, // now expected as an array of strings (URLs)
      video,  // now expected as a string URL
      categoryId,
      weight,
      makingCostPercent,
      wastagePercent
    } = req.body;

    
    // Ensure required fields are present
    if (!name || !productid || !images || images.length === 0 || !categoryId || !Array.isArray(categoryId) || categoryId.length === 0) {
      return res.status(400).json({ message: 'Name, Product ID, Category, and at least one image are required.' });
    }

    // Validate karat and get the gold rate
    const goldRate = await GoldRate.findOne({ karat }).sort({ updatedAt: -1 });
    
    if (!goldRate || !goldRate.ratePerGram) {
      return res.status(400).json({ message: `Gold rate not set for ${karat} karat.` });
    }

    // Convert inputs to numbers
    const parsedWeight = parseFloat(weight);
    const parsedMaking = parseFloat(makingCostPercent);
    const parsedWastage = parseFloat(wastagePercent);
    const parsedRate = parseFloat(goldRate.ratePerGram);

    // Validate numeric inputs
    if ([parsedWeight, parsedMaking, parsedWastage, parsedRate].some(isNaN)) {
      return res.status(400).json({ message: 'Invalid input: weight, rate, or percentage values are not numbers.' });
    }

    // Validate image URLs
    if (images.some(image => !/^(https?:\/\/[^\s]+)$/.test(image))) {
      return res.status(400).json({ message: 'Invalid image URL(s).' });
    }

    // Optional: Validate video URL format
    if (video && !/^(https?:\/\/[^\s]+)$/.test(video)) {
      return res.status(400).json({ message: 'Invalid video URL.' });
    }

    // Calculate the price breakdown
    const basePrice = parsedWeight * parsedRate;
    const makingCost = Math.round((parsedMaking / 100) * basePrice);
    const wastageCost = Math.round((parsedWastage / 100) * basePrice);
    const totalPrice = Math.round(basePrice + makingCost + wastageCost);

    // Create the new product
    const product = new Product({
      name,
      karat,
      shortdiscription,
      productid,
      images: Array.isArray(images) ? images : [], // Ensure images is an array of strings (URLs)
      video: video || null,  // Ensure video is either a URL or null
      categoryId,
      weight: parsedWeight,
      makingCostPercent: parsedMaking,
      wastagePercent: parsedWastage,
      price: totalPrice,
    });
    

    // Save the product to the database
    await product.save();

    // Send response with the product data and calculated costs
    res.status(201).json({
      ...product.toObject(),
      makingCost,
      wastageCost,
      goldRatePerGram: Math.round(parsedRate),
    });
  } catch (err) {
    next(err);
  }
};



export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const productsWithCalculatedData = await Promise.all(
      products.map(async (product) => {
        const goldRate = await GoldRate.findOne({ karat: product.karat }).sort({ createdAt: -1 });
        if (!goldRate || !goldRate.ratePerGram) {
          return { ...product.toObject(), error: 'Gold rate not found for this karat.' };
        }

        const parsedWeight = parseFloat(product.weight);
        const parsedMaking = parseFloat(product.makingCostPercent);
        const parsedWastage = parseFloat(product.wastagePercent);
        const parsedRate = parseFloat(goldRate.ratePerGram);

        const basePrice = parsedWeight * parsedRate;
        const makingCost = (parsedMaking / 100) * basePrice;
        const wastageCost = (parsedWastage / 100) * basePrice;
        const totalPrice = Math.round(basePrice + makingCost + wastageCost);

        return {
          ...product.toObject(),
          makingCost: Math.round(makingCost),
          wastageCost: Math.round(wastageCost),
          price: totalPrice,
          goldRatePerGram: parsedRate,
        };
      })
    );
    res.json(productsWithCalculatedData);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Try to get product by _id (Product ID)
    const product = await Product.findById(id);
    if (product) {
      const goldRate = await GoldRate.findOne({ karat: product.karat });

      if (!goldRate || !goldRate.ratePerGram) {
        return res.status(400).json({ message: 'Gold rate not set for this karat.' });
      }

      const parsedWeight = parseFloat(product.weight);
      const parsedMaking = parseFloat(product.makingCostPercent);
      const parsedWastage = parseFloat(product.wastagePercent);
      const parsedRate = parseFloat(goldRate.ratePerGram);

      const basePrice = parsedWeight * parsedRate;
      const makingCost = (parsedMaking / 100) * basePrice;
      const wastageCost = (parsedWastage / 100) * basePrice;
      const totalPrice = Math.round(basePrice + makingCost + wastageCost);

      return res.json({
        ...product.toObject(),
        makingCost: Math.round(makingCost),
        wastageCost: Math.round(wastageCost),
        price: totalPrice,
        goldRatePerGram: parsedRate,
      });
    }

    // 2. If not found, try to get by categoryId
    const products = await Product.find({ categoryId: id });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found with this ID.' });
    }

    return res.json(products);
  } catch (err) {
    next(err);
  }
};


export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      karat, 
      shortdiscription, 
      productid, 
      weight, 
      makingCostPercent,
      categoryId, 
      wastagePercent, 
      images, // now expected as an array of strings (URLs)
      video,  // now expected as a string URL
    } = req.body;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate the gold rate for the given karat
    const goldRate = await GoldRate.findOne({ karat });
    if (!goldRate || !goldRate.ratePerGram) {
      return res.status(400).json({ message: 'Gold rate not set for this karat.' });
    }

    // Parse the input values
    const parsedWeight = parseFloat(weight);
    const parsedMaking = parseFloat(makingCostPercent);
    const parsedWastage = parseFloat(wastagePercent);
    const parsedRate = parseFloat(goldRate.ratePerGram);

    if ([parsedWeight, parsedMaking, parsedWastage, parsedRate].some(isNaN)) {
      return res.status(400).json({ message: 'Invalid input: weight, rate, or percentage values are not numbers.' });
    }

    // Calculate the price breakdown
    const basePrice = parsedWeight * parsedRate;
    const makingCost = (parsedMaking / 100) * basePrice;
    const wastageCost = (parsedWastage / 100) * basePrice;
    const totalPrice = Math.round(basePrice + makingCost + wastageCost);

    // Prepare the update data
    const updateData = {
      name,
      karat,
      shortdiscription,
      productid,
      weight: parsedWeight,
      makingCostPercent: parsedMaking,
      wastagePercent: parsedWastage,
      price: totalPrice,
      categoryId,
      makingCost: Math.round(makingCost),
      wastageCost: Math.round(wastageCost),
      goldRatePerGram: Math.round(parsedRate),
    };

    if (categoryId && Array.isArray(categoryId)) {
      updateData.categoryId = categoryId;
    }
    // Handle images (expecting an array)
    if (Array.isArray(images)) {
      updateData.images = images;  // If images are provided in the body, update them
    }

    // Handle video (ensure video is a string URL or null)
    if (video) {
      updateData.video = video;  // If video URL is provided, update the video
    }

    // Handle image file upload (if new image file is uploaded)
    if (req.file) {
      try {
        const image = await uploadImageToCloudinary(req.file.buffer);
        // Add the image URL to the images array (or replace the array with the new image)
        updateData.images = Array.isArray(updateData.images) ? [...updateData.images, image] : [image];
      } catch (error) {
        return res.status(500).json({ message: "Image upload failed", error });
      }
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(500).json({ message: 'Failed to update product.' });
    }

    // Send back the updated product data
    res.json({
      ...updatedProduct.toObject(),
      makingCost: Math.round(makingCost),
      wastageCost: Math.round(wastageCost),
      goldRatePerGram: Math.round(parsedRate),
    });

  } catch (err) {
    next(err);
  }
};
