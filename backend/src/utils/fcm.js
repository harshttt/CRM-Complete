import admin from "../config/firebase.js";
import logger from "./logger.js";

export const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  if (!token) return;

  try {
    const message = {
      token,
      notification: { title, body },
      data,
    };

    await admin.messaging().send(message);

    logger.info(`[FCM] Push sent successfully`);
  } catch (err) {
    logger.error(`[FCM] Push failed`, err);
  }
};
