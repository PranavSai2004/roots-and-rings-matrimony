const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['profile_update', 'new_registration', 'payment_upload', 'other'],
    required: true
  },
  formUpdated: {
    type: String,
    enum: ['form1', 'photos', 'form2'],
  },
  changedFields: [{
    type: String
  }],
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema, 'admin_notifications');
