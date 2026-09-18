
import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { PROPERTY_ENUMS } from "../../constants/property.constants.js";

const propertySchema = BaseModel({
  name: { type: String, required: true },

  type: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.TYPE),
  },
  projectName: { type: String, required: false },
  propertyArea: { type: String, default: null },
  propertyAreaCity: { type: String, default: null },
  budgetMin: { type: Number, default: null },
  budgetMax: { type: Number, default: null },

  description: { type: String, default: null },
  configuration: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.CONFIGURATION),
    default: null,
  },

  timeline: { type: String, default: null },
  possessionStatus: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.POSSESSION_STATUS),
    default: null,
  },
  preferredContactTime: { type: String, default: null },
  propertyAge: { type: String, default: null },

  alternatePhones: [String],
  alternateEmails: [String],

  propertyType: String,

  score: { type: Number, default: 0 },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },

  location: {
    address: String,
    city: String,
    state: String,
    country: String,
  },

  amenities: [String],
  builder: String,
  interest: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.INTEREST),
    default: null,
  },

  status: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.STATUS),
    default: "active",
  },

  archivedAt: Date,
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  inventory: [
    {
      unitNo: String,
      status: {
        type: String,
        enum: Object.values(PROPERTY_ENUMS.INVENTORY_STATUS),
        default: "available",
      },
      price: Number,
    },
  ],

  preferredAreaCity: { type: String, default: null },
  primaryLocation: { type: String, default: null },
  reasonForSelling: { type: String, default: null },

  documentShared: {
    type: String,
    enum: Object.values(PROPERTY_ENUMS.DOCUMENT_TYPES),
    default: null,
  },

  media: [
    {
      type: String,
      url: String,
    },
  ],
});

// -----------------------------------
// INDEXES
// -----------------------------------
propertySchema.index({ name: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ "location.city": 1 });
propertySchema.index({ "inventory.status": 1 });
propertySchema.index({ createdAt: -1 });

export default mongoose.model("Property", propertySchema);
