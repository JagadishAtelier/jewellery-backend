import express from 'express';
import { addProduct, getProducts, deleteProduct, getProductById, updateProductById } from '../controllers/productController.js';
import upload from '../middleware/upload.js';
import { productValidator } from '../middleware/validators/productValidator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         karat:
 *           type: string
 *           enum: [24k, 22k, 18k]
 *           description: The karat of the gold
 *         shortdiscription:
 *           type: string
 *           description: A short description of the product
 *         productid:
 *           type: string
 *           description: A product ID or SKU of the product
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL of the product image
 *         weight:
 *           type: number
 *           format: float
 *           description: The weight of the product in grams
 *         makingCostPercent:
 *           type: number
 *           format: float
 *           description: The making cost percentage
 *         wastagePercent:
 *           type: number
 *           format: float
 *           description: The wastage percentage
 *         price:
 *           type: number
 *           format: float
 *           description: The calculated total price of the product
 *         makingCost:
 *           type: number
 *           format: float
 *           description: The calculated making cost
 *         wastageCost:
 *           type: number
 *           format: float
 *           description: The calculated wastage cost
 *         goldRatePerGram:
 *           type: number
 *           format: float
 *           description: The gold rate per gram at the time of calculation
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was last updated
 */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management
 */

// Routes

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - karat
 *               - shortdiscription
 *               - productid
 *               - weight
 *               - makingCostPercent
 *               - wastagePercent
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               karat:
 *                 type: string
 *                 enum: [24k, 22k, 18k]
 *               shortdiscription:
 *                 type: string
 *               productid:
 *                 type: string
 *               weight:
 *                 type: number
 *                 format: float
 *               makingCostPercent:
 *                 type: number
 *                 format: float
 *               wastagePercent:
 *                 type: number
 *                 format: float
 *               categoryid:
 *                 type: string
 *               image:
 *                 type: array
 *               video::
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation or rate error
 */
router.post('/',productValidator, addProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               karat:
 *                 type: string
 *                 enum: [24k, 22k, 18k]
 *               shortdiscription:
 *                 type: string
 *               productid:
 *                 type: string
 *               weight:
 *                 type: number
 *                 format: float
 *               makingCostPercent:
 *                 type: number
 *                 format: float
 *               wastagePercent:
 *                 type: number
 *                 format: float
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation or rate error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.single('image'), productValidator, updateProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 */
router.delete('/:id', deleteProduct);

export default router;
