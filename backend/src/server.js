import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(
      `🚀 WMS API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });

  // Fail loudly on unhandled rejections instead of hanging.
  process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

start();
