import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const sessionSchema = BaseModel({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: String,
  deviceType: { type: String, enum: ['android', 'ios', 'web', 'tablet', 'other'], default: 'web' },
  ip: String,
  userAgent: String,
  platform: String,
  location: {
    city: String,
    state: String,
    country: String,
    lat: Number,
    lon: Number
  },
  fcmToken: String,
  isActive: { type: Boolean, default: true },
  lastUsedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isLoggedOutByAdmin: { type: Boolean, default: false },
  suspicious: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 }
});

sessionSchema.index({ user: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ fcmToken: 1 });
sessionSchema.index({ lastUsedAt: -1 });

export default mongoose.model('Session', sessionSchema);