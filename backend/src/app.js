import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";

import { httpLogger } from "./utils/logger.js";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import loadModuleRoutes from "./modules/index.js";
import { activityLogger } from "./middlewares/activityLogger.js";
import { corsPolicy } from "./config/corsPolicy.js";
import { startCrons } from "./modules/cron/index.js";
import { FacebookWebhookController } from "./modules/facebook/facebook.controller.js";
import { LeadController } from "./modules/lead/lead.controller.js";

const app = express();
app.use(corsPolicy);
app.use(helmet());
app.use(httpLogger());
app.use(rateLimiterMiddleware);
app.use(activityLogger);
app.use(express.json());
app.use(express.static("src/public"));

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "CRM Backend Running" });
});
app.post("/api/webhook/facebook",express.json({verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  FacebookWebhookController.handler
);
app.get("/api/webhook/facebook",FacebookWebhookController.verify);
app.post("/api/facebook/page-token", FacebookWebhookController.savePageToken);
app.post("/api/lead/webhooks/leads", LeadController.ingest);

const apiRouter = express.Router();
loadModuleRoutes(apiRouter);

app.use("/api", apiRouter);
app.use(globalErrorHandler);
startCrons();

export default app;