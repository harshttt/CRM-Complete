import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const categorySchema = BaseModel({
  name: { type: String, required: true },
  description: { type: String, default: "" },
});

// unique index on name (case-insensitive) — use partial index or app-level check.
// Simple index:
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.model("Category", categorySchema);
