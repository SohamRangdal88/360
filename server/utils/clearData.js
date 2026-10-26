require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');

async function clearData() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty360');
  const result = await Faculty.deleteMany({});
  console.log(`Removed ${result.deletedCount} faculty records.`);
  await mongoose.disconnect();
}

clearData().catch((err) => {
  console.error(err);
  process.exit(1);
});
