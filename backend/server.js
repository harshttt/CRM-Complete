import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import logger from './src/utils/logger.js';
import { flushAllCache } from './src/utils/cache.js';
import { initSocket } from './src/config/socket.js';

const PORT = process.env.PORT || 5000;

connectDB();
flushAllCache()
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});