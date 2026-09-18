import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const customerSchema = BaseModel({
  // Customer / Account name
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },

  // Company / Account name
  companyName: {
    type: String,
    trim: true,
    maxlength: 200,
    default: "",
  },

  // Primary contact person
  contactPerson: {
    type: String,
    trim: true,
    maxlength: 200,
    default: "",
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: "",
    match: [
      /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
    ],
  },

  phone: {
    type: String,
    trim: true,
    default: "",
  },

  address: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },

  // Customer location
  latitude: {
    type: Number,
    default: null,
  },

  longitude: {
    type: Number,
    default: null,
  },

  // Additional customer information
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: "",
  },
});

customerSchema.index({ email: 1 });
customerSchema.index({ companyName: 1 });
customerSchema.index({
  name: "text",
  companyName: "text",
  contactPerson: "text",
});

export default mongoose.model("Customer", customerSchema);