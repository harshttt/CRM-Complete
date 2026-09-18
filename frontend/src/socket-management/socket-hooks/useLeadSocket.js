import useSocket from "./useSocket";
import { SOCKET_CONFIG } from "@/socket/socketConfig";
import { SOCKET_EVENTS } from "@/socket/socketEvents";

const useLeadSocket = (onUpdate) => {
  useSocket(
    SOCKET_CONFIG.NAMESPACES.LEADS,
    SOCKET_EVENTS.LEAD_UPDATED,
    onUpdate
  );
};

export default useLeadSocket;
