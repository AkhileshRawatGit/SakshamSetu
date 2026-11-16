const mongoose = require('mongoose');
const dns = require('dns');

let cachedPromise = null;

/**
 * Connect to MongoDB database (supports Local, Atlas, and Serverless on Vercel)
 */
const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // If connection is in progress, return the existing promise
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    const msg = 'MONGO_URI is not defined in environment variables. Please set it in .env.local or Vercel Environment Variables.';
    console.error(`❌ MongoDB Connection Error: ${msg}`);
    if (!process.env.VERCEL) process.exit(1);
    throw new Error(msg);
  }

  // Check for placeholder angle brackets (common mistake in Atlas connection strings)
  if (uri.includes('<') || uri.includes('>')) {
    const msg = 'MONGO_URI contains placeholder brackets "<" or ">". Please replace with your actual Atlas password.';
    console.error(`❌ MongoDB Connection Error: ${msg}`);
    if (!process.env.VERCEL) process.exit(1);
    throw new Error(msg);
  }

  // Fix Node.js DNS SRV resolution issues on Windows for Atlas mongodb+srv://
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch {
      // Ignore if setServers is not permitted
    }
  }

  const dbName = process.env.MONGO_DB_NAME || 'sakshamsetu';

  cachedPromise = mongoose
    .connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(`✅ MongoDB Connected to Atlas/Host: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${error.message}`);

      if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.error('👉 Hint: Check your Atlas username and password in MongoDB Atlas -> Database Access.');
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('Server selection timed out')) {
        console.error('👉 Hint: Check your Atlas Network Access (IP Whitelist). Make sure 0.0.0.0/0 is allowed.');
      } else if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
        console.error('👉 Hint: Could not resolve the Atlas cluster hostname. Check cluster URL in MongoDB Atlas.');
      }

      if (!process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
