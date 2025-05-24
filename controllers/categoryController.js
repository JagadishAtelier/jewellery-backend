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
/** POST /api/categories/item */
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
      // Update existing category
      const updateFields = {
        $push: { items: newItem },
      };

      if (columnClass) {
        updateFields.$set = { columnClass };
      }

      const updatedCategory = await Category.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      });

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      return res.status(200).json(updatedCategory);
    } else {
      // Create a new category
      if (!columnClass) {
        return res.status(400).json({ message: 'columnClass is required when creating a new category' });
      }

      const newCategory = new Category({
        columnClass,
        items: [newItem],
      });

      const savedCategory = await newCategory.save();
      return res.status(201).json(savedCategory);
    }
  } catch (err) {
    next(err);
  }
};

//POST /api/categories/style
export const createCategoryStyleOnly = async (req, res, next) => {
  try {
    const { columnClass } = req.body;

    if (!columnClass) {
      return res.status(400).json({ message: 'columnClass is required' });
    }

    const newCategory = new Category({
      columnClass,
      items: [],
    });

    const savedCategory = await newCategory.save();
    return res.status(201).json(savedCategory);
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
  
      const { label,link, description, bg, heightClass } = req.body;
      const updateFields = { label,link, description, bg, heightClass };
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



export const getCategoryItems = async (req, res, next) => {
  try {
    const categories = await Category.find({}, { items: 1, _id: 0 }); // only return 'items' field
    const allItems = categories.flatMap(cat => cat.items);
    res.json(allItems);
  } catch (err) {
    next(err);
  }
};