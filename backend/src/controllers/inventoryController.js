import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Add stock to a product (inbound)
 * @route   POST /api/inventory/inbound
 * @access  Private/Admin,Manager
 */
export const inbound = asyncHandler(async (req, res) => {
  const { productId, quantity, notes } = req.body;
  const qty = Number(quantity);

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  product.quantity += qty;
  await product.save();

  const log = await InventoryLog.create({
    productId: product._id,
    userId: req.user._id,
    action: 'inbound',
    quantity: qty,
    resultingQuantity: product.quantity,
    notes,
  });

  res.status(201).json({
    success: true,
    message: `Added ${qty} units to ${product.name}`,
    data: { product, log },
  });
});

/**
 * @desc    Remove stock from a product (outbound) with sufficiency check
 * @route   POST /api/inventory/outbound
 * @access  Private/Admin,Manager
 */
export const outbound = asyncHandler(async (req, res) => {
  const { productId, quantity, notes } = req.body;
  const qty = Number(quantity);

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  if (qty > product.quantity) {
    throw new ApiError(
      400,
      `Insufficient stock: only ${product.quantity} unit(s) of ${product.name} available`
    );
  }

  product.quantity -= qty;
  await product.save();

  const log = await InventoryLog.create({
    productId: product._id,
    userId: req.user._id,
    action: 'outbound',
    quantity: qty,
    resultingQuantity: product.quantity,
    notes,
  });

  res.status(201).json({
    success: true,
    message: `Removed ${qty} units from ${product.name}`,
    data: { product, log },
  });
});

/**
 * @desc    Get inventory movement history with filters
 * @route   GET /api/inventory/logs
 * @access  Private (all roles)
 * @query   productId, action, startDate, endDate, page, limit
 */
export const getLogs = asyncHandler(async (req, res) => {
  const {
    productId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 100,
  } = req.query;

  const filter = {};
  if (productId) filter.productId = productId;
  if (action && action !== 'all') filter.action = action;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      // include the whole end day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const total = await InventoryLog.countDocuments(filter);
  const logs = await InventoryLog.find(filter)
    .populate('productId', 'name sku category')
    .populate('userId', 'name role')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: pageNum,
    data: logs,
  });
});

/**
 * @desc    Get products at or below their low-stock threshold
 * @route   GET /api/inventory/low-stock
 * @access  Private (all roles)
 */
export const getLowStock = asyncHandler(async (_req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  }).sort({ quantity: 1 });

  res.json({ success: true, count: products.length, data: products });
});
