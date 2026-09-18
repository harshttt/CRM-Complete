import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { SALESPERSON_ENUMS } from "../../constants/saleperson.constants.js";



const salespersonScoreSchema = BaseModel({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  date: {type: Date,required: true,index: true},

  breakdown: {
    avs: { type: Number, default: 0 }, // Activity Volume
    tds: { type: Number, default: 0 }, // Task Discipline
    sls: { type: Number, default: 0 }, // Speed to Lead
    lpes:{ type: Number, default: 0 }, // Lead Progression
    crb: { type: Number, default: 0 }, // Client Response
    cqs: { type: Number, default: 0 }, // Conversation Quality
  },

  totalScore: { type: Number, default: 0 },

  // bucket: {
  //   type: String,
  //   enum: ["rockstar","high_performer","consistent","needs_improvement","risk_zone"],
  //   index: true,
  // },

    bucket: {
    type: String,
    enum: Object.values(SALESPERSON_ENUMS.BUCKET),
    default: SALESPERSON_ENUMS.BUCKET.CONSISTENT,
    index: true,
  },
});

salespersonScoreSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("SalespersonScore",salespersonScoreSchema);
