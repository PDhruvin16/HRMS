// logger.ts

const isDev: boolean = __DEV__;

type LogFn = (...args: unknown[]) => void;

interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const log: Logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    // keep errors even in release
    console.error('[ERROR]', ...args);
  },
};

export default log;
