import { Server } from "socket.io";
import registerNamespaces from "../sockets/index.js";
import logger from "../utils/logger.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  registerNamespaces(io);
  logger.info("[Socket] Socket.IO initialized");
  return io;
}
export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}