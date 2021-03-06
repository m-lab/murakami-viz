import log4js from 'koa-log4';

// Initialize worker here.
export default function startWorker(config) {
  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.log_level },
    },
  });

  return true;
}
