import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const noteSchema = BaseModel({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },

  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['manual', 'voice', 'auto_summary'],
    default: 'manual'
  },

  text: { type: String, required: true },

  tags: [String]
});

// -----------------------------------
// INDEXES
// -----------------------------------
noteSchema.index({ lead: 1 });
noteSchema.index({ meeting: 1 });
noteSchema.index({ task: 1 });
noteSchema.index({ addedBy: 1 });
noteSchema.index({ createdAt: -1 });

export default mongoose.model('Note', noteSchema);
