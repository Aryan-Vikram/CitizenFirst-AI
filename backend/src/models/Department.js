const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    connectionStatus: { type: String, enum: ['connected', 'degraded', 'offline'], default: 'connected' },
    lastSyncAt: { type: Date, default: Date.now },
    isMockIntegration: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
