
import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { LEAD_ENUMS } from "../../constants/lead.constants.js";

const leadSchema = BaseModel({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  projectName: { type: String, required: false },
  address: { type: String, required: false },
  alternatePhones: [String],
  alternateEmails: [String],
  source: {
    type: String,
    enum: Object.values(LEAD_ENUMS.SOURCE),
    default: LEAD_ENUMS.SOURCE.WEBSITE,
  },
  sourceBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BatchUpload",
    default: null,
  },

  tags: {
    type: [String],
    enum: Object.values(LEAD_ENUMS.TAGS),
    default: [LEAD_ENUMS.TAGS.LOW],
  },

  budgetMin: Number,
  budgetMax: Number,
  locationPreference: String,
   stage: {
    type: String,
    enum: [
      "fresh",
      "call_attempt",
      "call_back",
      "not_answered",
      "contacted",
      "project_done",
      "interested",
      "prospect",
      "qualified",
      "negotiation",
      "invalid",
      "junk_lead",
      "lost_lead",
      "follow_up",
      "payment",
      "reregistered",
      "onboarding",
      "meeting_scheduled",
      "future_prospect",
      "dump",
      "open",
      "site_visit",
      "in_progress",
      "unqualified",
      "closed_won",
      "closed_lost",
      "archived",
    ],
    default: "fresh",
  },
  // Assignment / ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  currentOwnerRole: { type: String, default: null }, // manager | team_lead | sales_exec
  // ownerType: { type: String,
  //   enum: Object.values(LEAD_ENUMS.OWNER_TYPE),
  //   default: LEAD_ENUMS.OWNER_TYPE.USER,
  //    },

    ownerType: { type: String,
    enum: ["system", "user", "team"],
    default: "user",
     },


  // historical owners (for visibility / audit)
  historicalOwners: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedAt: Date,
      releasedAt: Date,
      role: String,
    },
  ],

  branch: String,
  region: String,
  reason: String,

  // Locking to avoid race conditions
  isLocked: { type: Boolean, default: false },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lockedUntil: Date,
  // score: { type: Number, default: 0 },
  nextFollowUp: Date,

  // metrics / SLA
  lastAssignedAt: Date,
  firstContactedAt: Date,
  timeToFirstContactMinutes: Number,
  lastActivityAt: Date,
  lastContactedAt: Date,
  lastContactedAttemptAt: Date,

  // UTM params
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },

  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    default: null,
  },

  // tags: { type: ["String"], default: ["general"] },

  isDuplicate: { type: Boolean, default: false },
  duplicateOf: {type: mongoose.Schema.Types.ObjectId,ref: "Lead",default: null},
  hasDuplicates: {type: Boolean,default: false,index: true},
  duplicates: [ {type: mongoose.Schema.Types.ObjectId,ref: "Lead"}],
  duplicateReason: {type: String, default: null},
  duplicateCount: {type: Number,default: 0},
  // duplicateSource: {
  //   type: String, // webhook | manual | import | api
  //   default: null,
  // },


  // Soft-archive
  status: {
    type: String,
    enum: ["active", "archived", "auto_removed", "deactivated", "duplicate"],
    default: "active",
  },

  archived: { type: Boolean, default: false },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  archiveReason: String, // 'manual', 'NI', 'unanswered-24h', 'followup-expired'

  stageHistory: [
    {
      from: { type: String },
      to: { type: String },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],

  message: { type: String, default: null },

  // Assignment History
  assignmentHistory: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      roleFrom: String,
      roleTo: String,
      changedAt: { type: Date, default: Date.now },
      reason: String,
      batchId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchUpload" },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],

// CLIENT SCORING
score: { type: Number, default: 0 },
previousScore: {type: Number,default: 0},
scoreBreakdown: {
  lsis: { type: Number, default: 0 }, // Lead Source Intent Score
  crts: { type: Number, default: 0 }, // Client Response Time Score
  sps:  { type: Number, default: 0 }, // Stage Progression Score
  ces:  { type: Number, default: 0 }, // Client Engagement Score
  tm:   { type: Number, default: 1 }  // Tag Multiplier
},

scoreStatus: {
  type: String,
    enum: Object.values(LEAD_ENUMS.SCORE_STATUS),
    default: LEAD_ENUMS.SCORE_STATUS.OTHER,
  index: true
},

lastScoredAt: Date,
});

// INDEXES
leadSchema.index({ fullName: "text", phone: "text", email: "text" }); // search index
leadSchema.index({ stage: 1, lastActivityAt: -1 });
leadSchema.index({ createdAt: -1, updatedAt: -1, assignedTo: 1, leadId: 1 });
leadSchema.index({ currentOwner: 1 });
leadSchema.index({ branch: 1 });
leadSchema.index({ sourceBatchId: 1 });
leadSchema.index({ nextFollowUp: 1 });
leadSchema.index({ category: 1, lastActivityAt: -1 });
leadSchema.index({ "historicalOwners.user": 1 });
leadSchema.index({ lastAssignedAt: 1 });
leadSchema.index({ tags: 1 });
// leadSchema.index({ isAutoRemoved: 1 });

export default mongoose.model("Lead", leadSchema);
