


import IntegrationToken from "./facebookToken.model.js";
import axios from "axios";
import logger from "../../utils/logger.js";

// export async function getValidToken(pageId) {

//   logger.info({ pageId }, "[FB-TOKEN] Fetching token");

//   let token = await IntegrationToken.findOne({ pageId });

//   if (!token || token.expiresAt < new Date()) {
//     const refreshed = await refreshToken(token?.accessToken);

//     token = await IntegrationToken.findOneAndUpdate(
//       { pageId },
//       refreshed,
//       { upsert: true, new: true }
//     );
//       logger.info(
//       { pageId, expiresAt: token.expiresAt },
//       "[FB-TOKEN] Token refreshed"
//     );
//   }

//   return token.accessToken;
// }


export async function upsertFacebookPageToken({
  pageId,
  accessToken,
}) {
  const token = await IntegrationToken.findOneAndUpdate(
    { pageId },
    {
      provider: "facebook",
      pageId,
      accessToken,
    },
    { upsert: true, new: true }
  );

  logger.info(
    { pageId },
    "[FB-TOKEN] Page access token saved/updated"
  );

  return token;
}


export async function getValidToken(pageId) {
  const token = await IntegrationToken.findOne({ pageId });

  if (!token) {
    throw new Error("Facebook page token not configured");
  }

  return token.accessToken;
}

// async function refreshToken(oldToken) {
//   logger.info("[FB-TOKEN] Calling token exchange API");
//   const { data } = await axios.get(
//     "https://graph.facebook.com/v23.0/oauth/access_token",
//     {
//       params: {
//         grant_type: "fb_exchange_token",
//         client_id: process.env.FB_APP_ID,
//         client_secret: process.env.FB_APP_SECRET,
//         fb_exchange_token: oldToken,
//       },
//     }
//   );

//   logger.info("[FB-TOKEN] Token exchange successful");

//   return {
//     accessToken: data.access_token,
//     expiresAt: new Date(Date.now() + data.expires_in * 1000),
//   };
// }

