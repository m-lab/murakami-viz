import log from 'llog';
import startWorker from './worker.js';
import config from './config.js';

async function bootstrap() {
  return startWorker();
}

bootstrap()
  .then(() =>
    console.log(
      `👷 Worker operating over queue ${config.worker.queue} on ${
        config.redis.host
      }:${config.redis.port}!`,
    ),
  )
  .catch(err => {
    setImmediate(() => {
      log.error('Unable to run worker because of the following error:');
      log.error(err);
      throw err;
    });
  });
