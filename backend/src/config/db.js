const mongoose = require('mongoose');

/**
 * Attempts a MongoDB connection when MONGO_URI is configured.
 * CitizenFirst AI is designed to run its full demo flow even without a
 * database attached (see src/data/store.js), so a failed or missing
 * connection is logged, not fatal — this keeps the SIH demo resilient
 * while remaining a real, swappable production data layer.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('[db] MONGO_URI not set — running on the in-memory demo data store.');
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('[db] Connected to MongoDB.');
    return true;
  } catch (err) {
    console.warn(`[db] Could not connect to MongoDB (${err.message}). Falling back to the in-memory demo data store.`);
    return false;
  }
}

module.exports = { connectDB };
