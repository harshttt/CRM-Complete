import { notification } from "antd";
import useSocket from "./useSocket";
import { SOCKET_CONFIG } from "../socket/socketConfig";
import { SOCKET_EVENTS } from "../socket/socketEvents";
import useNotificationStore from "../../store/notificationStore";

const useNotificationSocket = () => {
     const addNotification = useNotificationStore(state => state.addNotification);
      useSocket(SOCKET_CONFIG.NAMESPACES.NOTIFICATIONS, SOCKET_EVENTS.NOTIFICATION_NEW,
         (payload) => {
             if (!payload || typeof payload !== "object") return;

              addNotification({
                id: payload?.id || Date.now(),
                title: payload?.title || "New Notification",
                message: payload?.message || "",
                createdAt: payload?.createdAt ? new Date(payload?.createdAt).toISOString() : new Date().toISOString(),
                read: false,
               });

             notification.open({
                message: payload.title || "Notification",
                description: payload.message || "You have a new update",
                placement: "topRight",
                style: {
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(230,247,255,0.95), rgba(255,255,255,0.95))",
                  boxShadow: "0 20px 40px rgba(37,99,235,0.25)",
                  border: "1px solid #bae0ff",
                },
       });
    }
  );  
};

export default useNotificationSocket;
