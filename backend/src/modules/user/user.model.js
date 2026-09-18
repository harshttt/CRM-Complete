import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const userSchema = BaseModel({

  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: true },
  role: {type: mongoose.Schema.Types.ObjectId,ref: 'Role'},
  parentUser: {type: mongoose.Schema.Types.ObjectId,ref: 'User',default: null},
  ancestorIds: [{type: mongoose.Schema.Types.ObjectId,ref: 'User'}],
  overridePermissions: [{
    permission: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
    type: { type: String, enum: ['ADD', 'REMOVE'], required: true }
  }],
  lastLoginAt: Date,
  lastLogoutAt: Date,
  lastPasswordChangeAt: Date,
  isOnline: { type: Boolean, default: false },
  socketIds: [String],
  branch: String,
  region: String,
  devices: [{
    deviceId: String,
    fcmToken: String
  }]
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ parentUser: 1 });
userSchema.index({ ancestorIds: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ region: 1 });
userSchema.index({
  fullName: 'text',
  email: 'text',
  phone: 'text'
});

export default mongoose.model('User', userSchema);