import Category from '../models/Category.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
/** GET /api/categories */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

/** GET /api/categories/:id */
export const getCategoryById = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

/** POST /api/categories */
export const createCategory = async (req, res, next) => {
    try {
      // handle multipart/form-data
      let imageUrl = null;
      if (req.file) {
        try {
          imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'categories');
        } catch (uploadErr) {
          return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
        }
      }
  
      const { name, description, bgClass, heightClass } = req.body;
      if (!name) return res.status(400).json({ message: 'Name is required' });
  
      const existing = await Category.findOne({ name });
      if (existing) return res.status(409).json({ message: 'Category already exists' });
  
      const cat = await Category.create({
        name,
        description,
        bgClass,
        heightClass,
        imageUrl,
      });
      res.status(201).json(cat);
    } catch (err) {
      next(err);
    }
  };
  
  /** PUT /api/categories/:id */
  export const updateCategory = async (req, res, next) => {
    try {
      let imageUrl;
      if (req.file) {
        try {
          imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'categories');
        } catch (uploadErr) {
          return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
        }
      }
  
      const { name, description, bgClass, heightClass } = req.body;
      const updateFields = { name, description, bgClass, heightClass };
      if (imageUrl) updateFields.imageUrl = imageUrl;
  
      const cat = await Category.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
  
      if (!cat) return res.status(404).json({ message: 'Category not found' });
      res.json(cat);
    } catch (err) {
      next(err);
    }
  };

/** DELETE /api/categories/:id */
export const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/categories/order */
export const updateCategoryOrder = async (req, res, next) => {
  try {
      const updates = req.body;

      if (!Array.isArray(updates)) {
          return res.status(400).json({ message: 'Invalid request body. Expected an array of updates.' });
      }

      const updatePromises = updates.map(async (update) => {
          if (!update._id || typeof update.position !== 'string') {
              return Promise.reject({ statusCode: 400, message: 'Each update must contain _id and position.' });
          }

          const updateFields = { position: update.position };
          if (typeof update.heightClass === 'string') {
              updateFields.heightClass = update.heightClass;
          }
          if (typeof update.columnClass === 'string') {
              updateFields.columnClass = update.columnClass;
          }

          const category = await Category.findByIdAndUpdate(
              update._id,
              updateFields,
              { new: true, runValidators: true }
          );
          if (!category) {
              return Promise.reject({ statusCode: 404, message: `Category not found with id: ${update._id}` });
          }
          return category;
      });

      const updatedCategories = await Promise.allSettled(updatePromises);

      const successfulUpdates = updatedCategories.filter(result => result.status === 'fulfilled').map(result => result.value);
      const failedUpdates = updatedCategories.filter(result => result.status === 'rejected').map(result => result.reason);

      if (failedUpdates.length > 0) {
          const firstError = failedUpdates[0];
          return res.status(firstError.statusCode || 500).json({
              message: 'Failed to update some categories.',
              errors: failedUpdates.map(err => ({ id: err.message?.split(' ')[5], message: err.message })),
              successfulUpdates: successfulUpdates.map(cat => cat._id)
          });
      }

      res.json(successfulUpdates);

  } catch (err) {
      next(err);
  }
};