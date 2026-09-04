const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    caseId: String,
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['assigned', 'inspection', 'info_requested', 'resolved', 'confirm_resolution', 'system'],
      default: 'system'
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
