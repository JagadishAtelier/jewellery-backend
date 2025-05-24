import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
      getCategoryItems,
      createCategoryStyleOnly,
} from '../controllers/categoryController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/style', createCategoryStyleOnly);


/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB generated unique ID
 *         name:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *           description: Optional description
 *         imageUrl:
 *           type: string
 *           description: URL to the category image
 *         bgClass:
 *           type: string
 *           description: CSS background class
 *         heightClass:
 *           type: string
 *           description: CSS height class
 *         position:
 *           type: string
 *           description: Layout position ID
 *         columnClass:
 *           type: string
 *           description: CSS column class
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a new category (with optional image upload)
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               bgClass:
 *                 type: string
 *               heightClass:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error (e.g. missing name)
 *       409:
 *         description: Category with that name already exists
 */
router
    .route('/')
    .get(getCategories)
    .post(upload.single('image'), createCategory);

    router.get('/items', getCategoryItems);
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by its ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update an existing category (with optional image upload)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the category
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               bgClass:
 *                 type: string
 *               heightClass:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file to upload
 *     responses:
 *       200:
 *         description: Updated category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router
    .route('/:id')
    .get(getCategoryById)
    .put(upload.single('image'), updateCategory)
    .delete(deleteCategory);


export default router;
