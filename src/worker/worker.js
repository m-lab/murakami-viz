import { Worker } from 'bullmq';
import config from './config.js';
// import { createTicket } from './fixme/fixme.js';

const startWorker = () => {
  const job = async job => {
    console.debug('Worker processed job:', job.data);
    let data;
    try {
      //     data = await createTicket(job.data);
    } catch (err) {
      console.error(`Failed to create ticket and archive url: ${err}`);
    }
    console.debug(`Data submitted successfully: ${data}`);
  };

  const worker = new Worker(config.worker.queue, job, {
    connection: { host: config.redis.host, port: config.redis.port },
  });
  return worker;
};
export default startWorker;
