// meta.facebook.cron.js
import cron from "node-cron";
import Redis from "ioredis";
import logger from "../../utils/logger.js";
import FacebookWebhookEvent from "../facebook/facebookWebhookEvent.model.js";
import { fetchFacebookLead } from "../facebook/facebook.service.js";
import { normalizeFacebookLead } from "../../utils/facebookNormalizer.js";
import AutomationLeadService from "../facebook/automationLead.service.js";
// import FacebookLeadSnapshot from "../facebook/facebookLeadSnapshot.model.js";

export function startFacebookLeadCron() {
  cron.schedule("*/5 * * * * *", async () => {
    logger.info(`[FB-LEAD-CRON] Started | PID: ${process.pid}`);

    try {
      const event = await FacebookWebhookEvent.findOneAndUpdate(
        {status: "pending"},
        {
          $set: {status: "processing",lockedAt: new Date()},
          $inc: { attempts: 1 },
        },
        {new: true,sort: { receivedAt: 1 }}
      );

      if (!event) {
        logger.info("[FB-LEAD-CRON] No pending event to lock");
        return;
      }

      logger.info(
        `[FB-LEAD-CRON] Locked event ${event.leadGenId}`
      );

      try {
        const fbLead = await fetchFacebookLead(event.leadGenId,event.pageId  );
        // await saveFacebookSnapshot({ fbLead, pageId: event.pageId});

          //STORE RAW GRAPH LEAD FOR ANALYTICS
      // await FacebookLeadSnapshot.create({
      //   provider: "facebook",
      //   leadGenId: event.leadGenId,
      //   pageId: event.pageId,
      //   formId: event.formId,
      //   createdTime: fbLead.created_time,
      //   fieldData: fbLead.field_data,
      //   metaInfo: {
      //     adId: fbLead.ad_id,
      //     adName: fbLead.ad_name,
      //     adSetId: fbLead.adset_id,
      //     campaignId: fbLead.campaign_id,
      //   },
      //   rawLeadPayload: fbLead,
      // });
        // const normalized = normalizeFacebookLead(fbLead);
        const normalized = normalizeFacebookLead(fbLead, {
        leadGenId: event.leadGenId,
        pageId: event.pageId,
        formId: event.formId,
      });

        await AutomationLeadService.saveFacebookLead(normalized);

        event.status = "done";
        await event.save();

        logger.info(
          `[FB-LEAD-CRON] Lead processed: ${event.leadGenId}`
        );
      } catch (err) {
        event.status = "failed";
        event.lastError = err.message;
        await event.save();

        logger.error(
          `[FB-LEAD-CRON] Processing failed ${event.leadGenId}`,
          err
        );
      }
    } catch (err) {
      logger.error("[FB-LEAD-CRON] Fatal error", err);
    }
  });
}
