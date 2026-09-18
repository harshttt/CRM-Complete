import config from "../../config";

export const SOCKET_CONFIG = {
  URL: config.socketapiUrl || "",

  NAMESPACES: {
    NOTIFICATIONS: "/notifications",
    // LEADS: "/leads",
    // CHAT: "/chat",
  },

  OPTIONS: {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000,
  },
};
