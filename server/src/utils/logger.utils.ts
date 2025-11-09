import pino from 'pino';
import os from 'os';

export const logger = pino({
   level: 'info',
   timestamp: () => `,"time":"${new Date().toISOString()}"`,
   base: { pid: process.pid, hostname: os.hostname() },
});
