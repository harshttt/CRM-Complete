import mongoose from 'mongoose';

const migrationHistorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now }
});

export default mongoose.model('MigrationHistory', migrationHistorySchema);
