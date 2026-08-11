import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Aggregate dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private (all roles)
 */
export const getStats = asyncHandler(async (_req, res) => {
  const [totals] = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalUnits: { $sum: '$quantity' },
      },
    },
  ]);

  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  });

  // Category breakdown for the dashboard chart.
  const byCategory = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        units: { $sum: '$quantity' },
        value: { $sum: { $multiply: ['$price', '$quantity'] } },
      },
    },
    { $sort: { value: -1 } },
  ]);

  // Recent movements for the activity feed.
  const recentLogs = await InventoryLog.find()
    .populate('productId', 'name sku')
    .populate('userId', 'name role')
    .sort({ createdAt: -1 })
    .limit(8);

  res.json({
    success: true,
    data: {
      totalProducts: totals?.totalProducts || 0,
      totalValue: totals?.totalValue || 0,
      totalUnits: totals?.totalUnits || 0,
      lowStockCount,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        count: c.count,
        units: c.units,
        value: c.value,
      })),
      recentLogs,
    },
  });
});
