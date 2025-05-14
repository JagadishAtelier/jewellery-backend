import express from 'express';
import { getalluser, postUser, requestOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *       400:
 *         description: Phone number missing
 *       500:
 *         description: OTP send failure
 */
router.post('/send-otp', requestOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify the OTP entered by user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - otp
 *               - phone
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "cf735a45-abc3-4d34-9a5e-xxxx"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP verified, login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: OTP verification failed
 */
router.post('/verify-otp', verifyOtp);

/**
 * @swagger
 * /api/auth/allusers:
 *   get:
 *     summary: Get all users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: A list of Users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/allusers',getalluser);
router.post('/create-user',postUser)
export default router;
