import mongoose from "mongoose";
// import BaseModel from "../../models/base.model.js";

const schema = new mongoose.Schema({
  source: {
    type: String,
    default: "meta",
    index: true,
  },

  date: {
    type: Date,
    default: Date.now,
    index: true,
  },

  data: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
});

schema.index({ source: 1, date: -1 });

export default mongoose.model("MetaRawData", schema);
