import { config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LOG_LEVELS[config.audit.logLevel as LogLevel] || LOG_LEVELS.info;

export const logger = {
  debug: (message: string, data?: any) => {
    if (LOG_LEVELS.debug >= currentLogLevel) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: any) => {
    if (LOG_LEVELS.info >= currentLogLevel) {
      console.log(`[INFO] ${message}`, data);
    }
  },

  warn: (message: string, data?: any) => {
    if (LOG_LEVELS.warn >= currentLogLevel) {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    if (LOG_LEVELS.error >= currentLogLevel) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};

export default logger;
