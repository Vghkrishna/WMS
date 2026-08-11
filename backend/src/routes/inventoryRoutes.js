import { Router } from 'express';
import { body } from 'express-validator';
import {
  inbound,
  outbound,
  getLogs,
  getLowStock,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import validate from '../middleware/validate.js';

const router = Router();

const movementValidation = [
  body('productId').notEmpty().withMessage('productId is required'),
  body('quantity')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),
];

router.use(protect);

router.post(
  '/inbound',
  authorize('admin', 'manager'),
  movementValidation,
  validate,
  inbound
);
router.post(
  '/outbound',
  authorize('admin', 'manager'),
  movementValidation,
  validate,
  outbound
);

router.get('/logs', getLogs);
router.get('/low-stock', getLowStock);

export default router;
