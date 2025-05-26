import Category from '../models/Category.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'categories');
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
      }
    }

    const { id, columnClass, link, description, label, bg, heightClass } = req.body;

    if (!link || !description || !label || !bg || !heightClass) {
      return res.status(400).json({ message: 'All fields except image and columnClass are required' });
    }

    const newItem = {
      link,
      description,
      label,
      bg,
      heightClass,
      imageUrl,
    };

    if (id) {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      category.items.push(newItem);
      if (columnClass) category.columnClass = columnClass;
      const updated = await category.save();
      return res.status(200).json(updated);
    } else {
      if (!columnClass) {
        return res.status(400).json({ message: 'columnClass is required when creating a new category' });
      }
      const newCategory = new Category({ columnClass, items: [newItem] });
      const savedCategory = await newCategory.save();
      return res.status(201).json(savedCategory);
    }
  } catch (err) {
    next(err);
  }
};

export const createCategoryStyleOnly = async (req, res, next) => {
  try {
    const { columnClass } = req.body;
    if (!columnClass) {
      return res.status(400).json({ message: 'columnClass is required' });
    }
    const newCategory = new Category({ columnClass, items: [] });
    const savedCategory = await newCategory.save();
    return res.status(201).json(savedCategory);
  } catch (err) {
    next(err);
  }
};

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

    const { label, link, description, bg, heightClass } = req.body;
    const updateFields = { label, link, description, bg, heightClass };
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const cat = await Category.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

export const getCategoryItems = async (req, res, next) => {
  try {
    const categories = await Category.find({}, { items: 1, _id: 0 });
    const allItems = categories.flatMap(cat => cat.items);
    res.json(allItems);
  } catch (err) {
    next(err);
  }
};

export const deleteCategoryItem = async (req, res, next) => {
  try {
    const { categoryId, itemId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.items = category.items.filter(item => item._id.toString() !== itemId);
    const updated = await category.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const updateCategoryItem = async (req, res, next) => {
  try {
    const { categoryId, itemId } = req.params; // Get categoryId and itemId from URL params

    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'categories');
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
      }
    }

    const { label, description, link, bg, heightClass } = req.body;

    // Find the category by its ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category column not found.' });
    }

    // Find the specific item within the category's items array
    const itemIndex = category.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Category item not found within this column.' });
    }

    // Update the item's properties
    if (label) category.items[itemIndex].label = label;
    if (description) category.items[itemIndex].description = description;
    if (link) category.items[itemIndex].link = link;
    if (bg) category.items[itemIndex].bg = bg;
    if (heightClass) category.items[itemIndex].heightClass = heightClass;
    if (imageUrl) category.items[itemIndex].imageUrl = imageUrl; // Update image if new one is uploaded

    const updatedCategory = await category.save();
    // Return the whole updated category or just the updated item, depending on frontend needs
    res.status(200).json(updatedCategory);
  } catch (err) {
    next(err);
  }
};