import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin,Manager
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  // Record the opening stock as an inbound movement when quantity > 0.
  if (product.quantity > 0) {
    await InventoryLog.create({
      productId: product._id,
      userId: req.user._id,
      action: 'inbound',
      quantity: product.quantity,
      resultingQuantity: product.quantity,
      notes: 'Initial stock on product creation',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

/**
 * @desc    Get all products with optional search / filter / sort
 * @route   GET /api/products
 * @access  Private (all roles)
 * @query   search, category, lowStock, sort, order, page, limit
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    lowStock,
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 100,
  } = req.query;

  const filter = {};

  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { sku: { $regex: term, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  let query = Product.find(filter).sort(sortObj);

  // lowStock filter compares two fields, so apply it via aggregation-friendly $expr.
  if (lowStock === 'true') {
    query = Product.find({
      ...filter,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).sort(sortObj);
  }

  const total = await Product.countDocuments(query.getFilter());
  const products = await query
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    data: products,
  });
});

/**
 * @desc    Get a single product with its recent movement history
 * @route   GET /api/products/:id
 * @access  Private (all roles)
 */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const logs = await InventoryLog.find({ productId: product._id })
    .populate('userId', 'name role')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, data: { product, logs } });
});

/**
 * @desc    Update a product's details (not stock — use inventory endpoints)
 * @route   PUT /api/products/:id
 * @access  Private/Admin,Manager
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = [
    'name',
    'sku',
    'category',
    'price',
    'location',
    'lowStockThreshold',
    'quantity',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

/**
 * @desc    Delete a product and its movement logs
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  await InventoryLog.deleteMany({ productId: product._id });
  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted successfully' });
});

/**
 * @desc    Distinct category list (handy for filter dropdowns)
 * @route   GET /api/products/meta/categories
 * @access  Private
 */
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, data: categories.sort() });
});
