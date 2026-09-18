import { useEffect } from "react";
import { getSocket } from "../socket/socketManager";

const useSocket = (namespace, event, handler) => {
  useEffect(() => {
    if (!namespace || !event || !handler) return;

    const socket = getSocket(namespace);
    if (!socket) return;

    const safeHandler = (payload) => {
      try {
        handler(payload);
      } catch (err) {
        // console.error("❌ Socket handler error:", err);
      }
    };

    socket.on(event, safeHandler);

    return () => {
      socket.off(event, safeHandler);
    };
  }, [namespace, event, handler]);
};

export default useSocket;
