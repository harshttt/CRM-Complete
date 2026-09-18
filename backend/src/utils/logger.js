import pino from 'pino';
import pinoHttp from 'pino-http';
import { createStream } from 'rotating-file-stream';
import fs from 'fs';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const PRETTY = process.env.LOG_PRETTY === 'true';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const fileStream = createStream('app.log', {
  interval: '1d',
  path: LOG_DIR
});
let consoleStream;
if (PRETTY) {
  consoleStream = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss'
    }
  });
} else {
  consoleStream = pino.destination(1);
}
const logger = pino(
  {
    level: LOG_LEVEL,
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      }
    }
  },
  pino.multistream([
    { stream: consoleStream },
    { stream: fileStream }
  ])
);
export const httpLogger = () =>
  pinoHttp({
    logger,
    customLogLevel(res) {
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    }
  });

export default logger;