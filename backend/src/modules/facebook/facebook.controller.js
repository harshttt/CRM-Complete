// facebook.controller.js
import crypto from "crypto";
import FacebookWebhookEvent from "./facebookWebhookEvent.model.js";
import { upsertFacebookPageToken } from "./facebookToken.service.js";
import logger from "../../utils/logger.js";

function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.FB_APP_SECRET)
      .update(req.rawBody)
      .digest("hex");

  return signature === expected;
}

export class FacebookWebhookController {
  static verify(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.FB_VERIFY_TOKEN) {
      logger.info("[FB-WEBHOOK] Verification successful");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  //webhook verfiy https://resistantly-moneyless-sebastian.ngrok-free.dev/api/webhook/facebook?hub.mode=subscribe&hub.challenge=999999&hub.verify_token=123456

//permisson verify

// pages_show_list
// ads_management
// business_management
// leads_retrieval
// pages_read_engagement
// pages_manage_metadata
// pages_manage_ads

  //   static verify(req, res) {
  //   logger.info(
  //     {
  //       mode: req.query["hub.mode"],
  //       token: req.query["hub.verify_token"],
  //     },
  //     "[FB-WEBHOOK] Verify request received"
  //   );

  //   if (
  //     req.query["hub.mode"] === "subscribe" &&
  //     req.query["hub.verify_token"] === process.env.FB_VERIFY_TOKEN
  //   ) {
  //     logger.info("[FB-WEBHOOK] Verification successful");
  //     return res.status(200).send(req.query["hub.challenge"]);
  //   }

  //   logger.warn("[FB-WEBHOOK] Verification failed");
  //   return res.sendStatus(403);
  // }
  //webhook verfiy https://resistantly-moneyless-sebastian.ngrok-free.dev/api/webhook/facebook
  //https://resistantly-moneyless-sebastian.ngrok-free.dev/api/webhook/facebook?hub.mode=subscribe&hub.challenge=999999&hub.verify_token=123456

  static async handler(req, res) {
    res.sendStatus(200); // FAST ACK

    // if (!verifySignature(req)) {
    //   console.error("Invalid Facebook signature");
    //   return;
    // }

      const payload = req.body;




  // 🔥 LOG RAW META PAYLOAD
  logger.info(
    {
      payload,
    },
    "[FB-WEBHOOK] Raw webhook payload received"
  );

    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    // const entry = req.body.entry?.[0];
    // const change = entry?.changes?.[0];
    const leadGenId = change?.value?.leadgen_id;
    const formId = change?.value?.form_id;
    const pageId = change?.value?.page_id;

    if (!leadGenId || !pageId) return;

    logger.info({leadGenId, pageId,formId,},
      "[FB-LEAD] New lead received"
    );

    await FacebookWebhookEvent.create({
      provider: "facebook",
      leadGenId,
      pageId,
      formId,
      webhookPayload: payload,
      status: "pending",
      receivedAt: new Date(),
    });

    
  logger.info(
    { leadGenId, pageId, formId },
    "[FB-WEBHOOK] Event stored successfully"
  );

  }


  static async savePageToken(req, res) {
    try {
      const { pageId, accessToken } = req.body;

      if (!pageId || !accessToken) {
        return res.status(400).json({
          success: false,
          message: "pageId and accessToken are required",
        });
      }

      const token = await upsertFacebookPageToken({
        pageId,
        accessToken,
      });

      return res.json({
        success: true,
        message: "Facebook page token saved successfully",
        data: {
          pageId: token.pageId,
        },
      });
    } catch (err) {
      logger.error(
        "[FB-TOKEN] Save failed",
        err
      );

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

}


//post/pageId/pageAccesstoken
//pageid 
//post  904489002755668/subscribed_apps?subscribed_fields=leadgen&access_token=EAAMixo5jiCYBQof4JwoCn0sqpOT2QnZBNR87lJXsh232yGZCcEdYpRfumKuoGhBmpNm6CIylqr6pMZBwdMOPTqXKu5Fq5Cf94xQ49aoyuMeO7ISw6sYlmjRQDqz2OH78hUARBAZBSSv6o3HemDHCZBds2ZChZBfklHxreythR1cjHrR9cYJOljzyfUqGWjlp3FT0MZAa5lZBSkFXbsN13ZBSPxjZBl7iAaMZAt0she4PKNGZBZA1AZD  and select page in side menu
//get  904489002755668/subscribed_apps
