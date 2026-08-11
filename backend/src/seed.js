/**
 * Seed script — creates demo users and products so the app can be
 * explored immediately. Run with: npm run seed
 *
 * WARNING: this clears the Users, Products and InventoryLogs collections.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import InventoryLog from './models/InventoryLog.js';

dotenv.config();

const users = [
  { name: 'Admin User', email: 'admin@wms.com', password: 'admin123', role: 'admin' },
  { name: 'Manager User', email: 'manager@wms.com', password: 'manager123', role: 'manager' },
  { name: 'Staff User', email: 'staff@wms.com', password: 'staff123', role: 'staff' },
];

const products = [
  { name: 'Wireless Mouse', sku: 'ELE-MOU-001', category: 'Electronics', quantity: 120, price: 25.99, location: 'A1-R2', lowStockThreshold: 20 },
  { name: 'Mechanical Keyboard', sku: 'ELE-KEY-002', category: 'Electronics', quantity: 8, price: 79.99, location: 'A1-R3', lowStockThreshold: 15 },
  { name: 'USB-C Cable 2m', sku: 'ELE-CAB-003', category: 'Electronics', quantity: 300, price: 9.5, location: 'A2-R1', lowStockThreshold: 50 },
  { name: '27" Monitor', sku: 'ELE-MON-004', category: 'Electronics', quantity: 14, price: 199.0, location: 'B1-R1', lowStockThreshold: 10 },
  { name: 'Office Chair', sku: 'FUR-CHR-005', category: 'Furniture', quantity: 35, price: 149.99, location: 'C3-R2', lowStockThreshold: 10 },
  { name: 'Standing Desk', sku: 'FUR-DSK-006', category: 'Furniture', quantity: 5, price: 349.0, location: 'C3-R4', lowStockThreshold: 6 },
  { name: 'A4 Paper Ream', sku: 'STA-PAP-007', category: 'Stationery', quantity: 500, price: 4.25, location: 'D1-R1', lowStockThreshold: 100 },
  { name: 'Ballpoint Pens (Box)', sku: 'STA-PEN-008', category: 'Stationery', quantity: 9, price: 12.0, location: 'D1-R2', lowStockThreshold: 25 },
  { name: 'Packing Tape', sku: 'PKG-TAP-009', category: 'Packaging', quantity: 220, price: 2.75, location: 'E2-R1', lowStockThreshold: 40 },
  { name: 'Cardboard Box (L)', sku: 'PKG-BOX-010', category: 'Packaging', quantity: 18, price: 1.5, location: 'E2-R3', lowStockThreshold: 30 },
];

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    InventoryLog.deleteMany({}),
  ]);

  // create() runs the pre-save hook so passwords get hashed.
  const createdUsers = await User.create(users);
  const admin = createdUsers.find((u) => u.role === 'admin');

  const createdProducts = await Product.create(products);

  const logs = createdProducts.map((p) => ({
    productId: p._id,
    userId: admin._id,
    action: 'inbound',
    quantity: p.quantity,
    resultingQuantity: p.quantity,
    notes: 'Initial seed stock',
  }));
  await InventoryLog.create(logs);

  console.log(`✅ Seeded ${createdUsers.length} users and ${createdProducts.length} products`);
  console.log('\nDemo credentials:');
  console.log('  Admin   → admin@wms.com / admin123');
  console.log('  Manager → manager@wms.com / manager123');
  console.log('  Staff   → staff@wms.com / staff123\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
