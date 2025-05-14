import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jewelry Dashboard API',
      version: '1.0.0',
      description: 'API for managing gold rates and products',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      schemas: {
        GoldRate: {
          type: 'object',
          properties: {
            karat: {
              type: 'string',
              enum: ['24k', '22k', '18k'],
              example: '22k',
            },
            ratePerGram: {
              type: 'number',
              format: 'float',
              example: 8345.67,
            },
            ratePerPoun: {
              type: 'number',
              format: 'float',
              example: 66765.36, // 8345.67 * 8
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-23T12:00:00.000Z',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            karat: { type: 'string', example: '24k' },
            image: { type: 'string' },
            weight: { type: 'number', example: 8.5 },
            makingCostPercent: { type: 'number', example: 2.5 },
            wastagePercent: { type: 'number', example: 2.5 },
            makingCostValue: { type: 'number', example: 1100 },
            wastageValue: { type: 'number', example: 1100 },
            price: { type: 'number', example: 83270 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
