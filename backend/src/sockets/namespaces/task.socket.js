import logger from "../../utils/logger.js";
import socketAuth from "../../middlewares/socketAuth.middleware.js";
import {registerSocket,unregisterSocket} from "../utils/socketUserMap.js";

export default function registerTaskNamespace(io) {
  const nsp = io.of("/tasks");

  nsp.use(socketAuth);

  logger.info("[Socket] Task namespace registered");

  nsp.on("connection", socket => {
    const userId = socket.user._id.toString();
    const token = socket.token;

    registerSocket(io, userId, token, socket.id);

    logger.info(`[Socket] User ${userId} connected to /tasks`);

    socket.on("disconnect", () => {
      unregisterSocket(userId, socket.id);
      logger.info(`[Socket] User ${userId} disconnected from /tasks`);
    });
  });
}
