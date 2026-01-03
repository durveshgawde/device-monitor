const levels = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🐛'
};

export const logger = {
  error: (msg: string, err?: any) => {
    console.error(`${levels.error} [ERROR]`, msg);
    if (err) console.error(err);
  },
  warn: (msg: string) => console.warn(`${levels.warn} [WARN]`, msg),
  info: (msg: string) => console.log(`${levels.info} [INFO]`, msg),
  debug: (msg: string) => process.env.NODE_ENV === 'development' && 
    console.log(`${levels.debug} [DEBUG]`, msg)
};
