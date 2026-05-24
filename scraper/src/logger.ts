import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFile = path.join(logsDir, `scrape-${new Date().toISOString().slice(0, 10)}.log`);

export const logger = pino(
  { level: 'debug' },
  pino.multistream([
    {
      level: 'debug',
      stream: pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }),
    },
    {
      level: 'debug',
      stream: fs.createWriteStream(logFile, { flags: 'a' }),
    },
  ])
);
