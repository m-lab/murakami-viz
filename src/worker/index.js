#!/usr/bin/env node
import config from './config.js';
config.parse(process.argv);

import createWorker from './worker.js';

async function bootstrap() {
  return createWorker(config);
}

bootstrap()
  .then(() => console.log(`👷  Worker running!`))
  .catch(err => {
    setImmediate(() => {
      console.error('Unable to run worker because of the following error:');
      console.error(err);
    });
  });
