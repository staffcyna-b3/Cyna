import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
const logFilePath = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function formatLog(level: string, message: string, meta?: any) {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';

  return `[${formattedDate}] [${level.toUpperCase()}] ${message}${metaString}\n`;
}

export class Logger {
  static info(message: string, meta?: any) {
    console.log(formatLog('info', message, meta));
    fs.appendFileSync(logFilePath, formatLog('info', message, meta));
  }

  static warn(message: string, meta?: any) {
    console.warn(formatLog('warn', message, meta));
    fs.appendFileSync(logFilePath, formatLog('warn', message, meta));
  }

  static error(message: string, meta?: any) {
    console.error(formatLog('error', message, meta));
    fs.appendFileSync(logFilePath, formatLog('error', message, meta));
  }
}
