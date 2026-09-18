import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const systemActivitySchema = BaseModel({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },

  // Category-based action tracking
  category: {
    type: String,
    enum: ['auth', 'api', 'socket', 'ui', 'security'],
    required: true
  },

  action: {
    type: String,
    required: true
  },

  description: String,

  // Device & network
  ip: String,
  userAgent: String,
  platform: String,
  path: String, // API endpoint or UI route
  method: String, // GET, POST etc.

  // Auto-metadata from client or backend
  metadata: mongoose.Schema.Types.Mixed,

  // Flags
  success: { type: Boolean, default: true },
  statusCode: Number
});

// Indexes
systemActivitySchema.index({ user: 1 });
systemActivitySchema.index({ category: 1 });
systemActivitySchema.index({ action: 1 });
systemActivitySchema.index({ createdAt: -1 });

export default mongoose.model('SystemActivity', systemActivitySchema);