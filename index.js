import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import goldRateRoutes from './routes/goldRateRoutes.js';
import productRoutes from './routes/productRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from "./routes/analyticsRoutes.js";
import silverRateRoutes from './routes/silverRateRouter.js';
import combinedRatesRoute from './routes/MetalRatesRoute.js';
import platinumRateRoutes from './routes/platinumRateRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import './goldRateCron.js';


dotenv.config();
const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_DASH_URL, process.env.FRONTEND_CLIENT_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);



// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());

// Routes
app.use('/api/gold-rates', goldRateRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth',authRoutes);
app.use("/api/analytics", analyticsRoutes);
// Error handling
app.use(errorHandler);

app.use('/api/silver-rates', silverRateRoutes);
app.use('/api/platinum-rates', platinumRateRoutes);
app.use(combinedRatesRoute);

// DB + Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs: http://localhost:${PORT}/api-docs`);
  });
});
