import cors from "cors";

const allowedOrigins = process.env.CORS_ORIGINS
  ? new Set(process.env.CORS_ORIGINS.split(",").map(o => o.trim()))
  : new Set();
console.log("CORS allowed origins:", [...allowedOrigins]);

export const corsPolicy = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }
    console.warn(`CORS_BLOCKED origin=${normalizedOrigin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});