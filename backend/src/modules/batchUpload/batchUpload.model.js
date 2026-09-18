import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const batchUploadSchema = BaseModel({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String },
  totalCount: { type: Number, default: 0 },
  processedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  filePath: { type: String },
  status: { type: String, enum: ['processing', 'done', 'failed'], default: 'processing' },
  failedRows: [mongoose.Schema.Types.Mixed]
});

batchUploadSchema.index({ createdAt: -1 });

export default mongoose.model('BatchUpload', batchUploadSchema);
