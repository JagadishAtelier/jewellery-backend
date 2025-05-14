import { body, validationResult } from 'express-validator';

export const productValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('karat').isIn(['24k', '22k', '18k']).withMessage('Invalid karat value'),
  body('shortdiscription').notEmpty().withMessage('Invalid shortdiscription value'),
  body('productid').notEmpty().withMessage('Invalid productid value'),
  body('weight').isFloat({ gt: 0 }).withMessage('Weight must be a number greater than 0'),
  body('makingCostPercent').isFloat({ min: 0 }).withMessage('Making cost must be positive'),
  body('wastagePercent').isFloat({ min: 0 }).withMessage('Wastage must be positive'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
