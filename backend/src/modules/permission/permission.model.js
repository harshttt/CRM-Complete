import mongoose from 'mongoose';
import BaseModel from '../../models/base.model.js';

const permissionSchema = BaseModel({
  name: { type: String, required: true },
  module: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String }
});
permissionSchema.index({ name: 1 }, { unique: true }); 
permissionSchema.index({ module: 1 });
permissionSchema.index({ action: 1 });

export default mongoose.model('Permission', permissionSchema);