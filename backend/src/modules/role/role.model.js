import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const roleSchema = BaseModel({
  name: { type: String, required: true },
  description: { type: String },
  roleLevel: { type: Number },
  permissions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }
  ],
  isSystem: { type: Boolean, default: false }
});
roleSchema.index({ name: 1 }, { unique: true });
// roleSchema.index({ name: "text", description: "text" });
export default mongoose.model('Role', roleSchema);