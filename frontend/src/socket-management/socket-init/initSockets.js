import { connectSocket } from "../socket/socketManager";
import { SOCKET_CONFIG } from "../socket/socketConfig";

let initialized = false;

export const initSockets = (user) => {
  try {
    if (initialized) return;
    if (!user?.id || !user?.token) {
      // console.warn("⚠️ initSockets skipped: invalid user");
      return;
    }

    Object.values(SOCKET_CONFIG.NAMESPACES).forEach((namespace) => {
      connectSocket({
        namespace,
        userId: user?.id,
        token: user?.token,
      });
    });

    initialized = true;
    // console.log("✅ Sockets initialized");
  } catch (err) {
    // console.error("❌ initSockets failed", err);
  }
};

export const resetSockets = () => {
  initialized = false;
};
