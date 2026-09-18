

import mongoose from "mongoose";

export function normalizeId(value) {
  // 1. Null/undefined
  if (value === null || value === undefined) return value;

  // 2. Already primitive
  if (typeof value !== "object") return value;

  // 3. Direct ObjectId
  if (value._bsontype === "ObjectID") return String(value);

  // 4. Binary buffer (aggregation output)
  if (value._bsontype === "Binary" || value.buffer) {
    try {
      return String(new mongoose.Types.ObjectId(value.buffer));
    } catch {
      return value;
    }
  }

  return null;
}

//MAIN UNIVERSAL DEEP TRANSFORM
export function deepTransform(obj) {
  if (obj === null || obj === undefined) return obj;

  // If value is a Date → return as ISO string (or as Date object)
  if (obj instanceof Date) return obj.toISOString();

  // primitive
  if (typeof obj !== "object") return obj;

  // Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepTransform(item));
  }

  // Binary/ObjectId
  const normalized = normalizeId(obj);
  if (normalized !== null) return normalized;

  // plain object
  const out = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    // special case: _id → id
    if (key === "_id") {
      out.id = normalizeId(value) || String(value);
      continue;
    }

    out[key] = deepTransform(value);
  }

  return out;
}




