import mongoose from 'mongoose';

/**
 * Establish a connection to MongoDB using the URI from the environment.
 * Exits the process on an initial connection failure so orchestration
 * tools (pm2, docker, render) can restart cleanly.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
