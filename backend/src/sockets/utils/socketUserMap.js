// userId -> { token, sockets: Set(socketId) }
const userSocketMap = new Map();

/**
 * On new connection:
 * - disconnect all sockets for old token
 * - register sockets for new token
 */
export function registerSocket(io, userId, token, socketId) {
  const existing = userSocketMap.get(userId);

  //If user connects with NEW token → kill old sockets
  if (existing && existing.token !== token) {
    for (const oldSocketId of existing.sockets) {
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
      }
    }
  }

  // Register fresh
  userSocketMap.set(userId, {
    token,
    sockets: new Set([socketId])
  });
}

export function unregisterSocket(userId, socketId) {
  const record = userSocketMap.get(userId);
  if (!record) return;

  record.sockets.delete(socketId);

  if (record.sockets.size === 0) {
    userSocketMap.delete(userId);
  }
}

export function getUserSockets(userId) {
  return userSocketMap.get(userId)?.sockets || new Set();
}
