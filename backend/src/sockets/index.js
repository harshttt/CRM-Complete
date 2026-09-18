import registerNotificationNamespace from "./namespaces/notification.socket.js";
import registerTaskNamespace from "./namespaces/task.socket.js";


export default function registerNamespaces(io) {
  registerNotificationNamespace(io);
  registerTaskNamespace(io);
}
