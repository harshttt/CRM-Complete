
import axios from "axios";
import { getValidToken } from "./facebookToken.service.js";
import logger from "../../utils/logger.js";
import MetaRawData from "./metaRawData.model.js";


export async function fetchFacebookLead(leadgenId, pageId) {

  logger.info({ leadgenId, pageId }, "[FB-LEAD] Fetching lead");
  const token = await getValidToken(pageId);
  console.log("Token retrieved:", token);
  logger.info("[FB-LEAD] Token retrieved successfully");

      const { data } = await axios.get(
    `https://graph.facebook.com/v24.0/${leadgenId}`,
    {
      params: {
        access_token: token,
        fields:
          "created_time,ad_id,ad_name,adset_id,campaign_id,field_data",
      },
    }
  );
  

  console.log("Lead data fetched leadGenId:", data);
  logger.info("[FB-LEAD] Lead data fetched successfully");
  await MetaRawData.create({ 
  source: "meta",
  data: data,
});

  return data;
}

