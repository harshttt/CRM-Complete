import FacebookLeadSnapshot from "./facebookLeadSnapshot.model.js";
import logger from "../../utils/logger.js";

export async function saveFacebookSnapshot({ fbData, pageId }) {
  const map = {};
  const fieldNames = [];

  fbData.field_data?.forEach(f => {
    fieldNames.push(f.name);
    map[f.name] = f.values?.[0] || null;
  });

  const snapshot = await FacebookLeadSnapshot.create({
    leadGenId: fbData.id,
    formId: fbData.form_id,
    pageId,
    rawPayload: fbData,
    fieldNames,
    normalizedMap: map,
  });

  logger.info(
    { snapshotId: snapshot._id },
    "[FB-SNAPSHOT] Lead snapshot saved"
  );

  return snapshot;
}
