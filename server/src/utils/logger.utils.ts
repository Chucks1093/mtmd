import pino from 'pino';
import os from 'os';

export const logger = pino({
   level: process.env.LOG_LEVEL || 'info',
   timestamp: () => `,"time":"${new Date().toISOString()}"`,
   base: { pid: process.pid, hostname: os.hostname() },
});
