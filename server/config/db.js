const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty360';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[WARN] MongoDB not connected: ${err.message}. Server running in memory/offline mode.`);
    return false;
  }
}

module.exports = connectDB;
