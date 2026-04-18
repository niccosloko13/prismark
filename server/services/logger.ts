export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.info(`[prismarq] ${message}`, context ?? {});
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[prismarq] ${message}`, context ?? {});
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(`[prismarq] ${message}`, context ?? {});
  },
};
