import { Queue } from 'bullmq';
import uuidv4 from 'uuid/v4';
import Joi from 'joi';
import config from '../config.js';
import { ServerError, UnprocessableError } from '../../common/errors.js';

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class QueueManager {
  /**
   * @constructor QueueManager
   */
  constructor(host, port) {
    this.connection = { host: host, port: port };
    this.queues = new Map();
  }

  /**
   * Process web request to Queue API
   *
   * @param {string} queueId - Optional identifier for specific queue
   * @param {Object} job - JSON object for processing
   */
  async enqueue({ queueId = config.worker.queue, job }) {
    try {
      Joi.string().validate(queueId);
    } catch (err) {
      throw new UnprocessableError(`Invalid queue ID ${queueId}`, err);
    }

    if (job) {
      if (!(queueId in this.queues)) {
        this.queues[queueId] = new Queue(queueId, {
          connection: this.connection,
        });
        await this.queues[queueId].waitUntilReady();
      }
      const uuid = uuidv4();
      try {
        await this.queues[queueId].add(uuid, job);
      } catch (err) {
        throw new ServerError(
          `Failed to add job ${uuid} to queue ${queueId}`,
          err,
        );
      }
      return uuid;
    }
    console.error(`No data provided to queue ${queueId}.`);
    return;
  }

  /**
   * Retrieve jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {Array} types - Optional identifier(s) for job statuses
   * @param {integer} start - Index to start from in list of jobs in queue
   * @param {integer} end - Index to stop at for listing jobs in queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async list({ queueIds, types, start = 0, end = -1, asc = false }) {
    queueIds = Array.isArray(queueIds) ? queueIds : [queueIds];
    try {
      Joi.array()
        .items(Joi.string())
        .validate(queueIds);
      Joi.array().items(
        Joi.string().valid(
          'completed',
          'failed',
          'delayed',
          'repeat',
          'active',
          'wait',
          'paused',
        ),
      );
      Joi.number()
        .integer()
        .positive()
        .validate(start);
      Joi.number()
        .integer()
        .validate(end);
      Joi.bool().validate(asc);
    } catch (err) {
      throw new ServerError('Invalid query parameters', err);
    }

    let ret = new Array();

    // eslint-disable-next-line no-unused-vars
    this.queues.forEach(async (key, value, map) => {
      if (queueIds.includes(key) || queueIds.length === 0) {
        let jobs = await value.getJobs(types, start, end, asc);
        ret.concat(ret, jobs);
      }
    });
    return ret;
  }

  /**
   * Retrieve all jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listAll({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, asc: asc });
  }

  /**
   * Retrieve completed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listCompleted({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'completed', asc: asc });
  }

  /**
   * Retrieve failed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listFailed({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'failed', asc: asc });
  }

  /**
   * Retrieve delayed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listDelayed({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'delayed', asc: asc });
  }

  /**
   * Retrieve repeat jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listRepeat({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'repeat', asc: asc });
  }

  /**
   * Retrieve active jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listActive({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'active', asc: asc });
  }

  /**
   * Retrieve wait jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listWait({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'wait', asc: asc });
  }

  /**
   * Retrieve paused jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listPaused({ queueIds = config.worker.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'paused', asc: asc });
  }
}
