import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "./socketConfig";

const socketStore = {}; // { namespace: socket }

export const connectSocket = ({ namespace, userId, token }) => {
  // 🔒 VALIDATION
  if (!SOCKET_CONFIG.URL) {
    // console.error("❌ SOCKET_URL missing");
    return null;
  }

  if (!namespace) {
    // console.warn("⚠️ Namespace missing");
    return null;
  }

  if (!userId || !token) {
    // console.warn("⚠️ Socket skipped: userId or token missing");
    return null;
  }

  // 🧠 Prevent duplicate connection
  if (socketStore[namespace]) {
    return socketStore[namespace];
  }

  try {
    // console.log("🔌 CONNECTING TO:", `${SOCKET_CONFIG.URL}${namespace} ${token}`);

    const socket = io(`${SOCKET_CONFIG.URL}${namespace}`, {
      ...SOCKET_CONFIG.OPTIONS,
      auth: { token },
    });

    socket.on("connect", () => {
      // console.log(`✅ Socket connected → ${namespace}`);
      socket.emit("join", { userId });
    });

    socket.on("connect_error", (err) => {
      // console.error(`❌ Socket error [${namespace}]:`, err.message);
    });

    socket.on("disconnect", (reason) => {
      // console.warn(`⚠️ Socket disconnected [${namespace}]:`, reason);
    });

    socketStore[namespace] = socket;
    return socket;
  } catch (err) {
    // console.error(`❌ Failed to init socket [${namespace}]`, err);
    return null;
  }
};

export const getSocket = (namespace) => {
  return socketStore[namespace] || null;
};

export const disconnectAllSockets = () => {
  Object.keys(socketStore).forEach((ns) => {
    try {
      socketStore[ns]?.disconnect();
    } catch (e) {
      // console.warn(`⚠️ Error disconnecting ${ns}`);
    }
    delete socketStore[ns];
  });
};
