import Router from '@koa/router';
import auth from '../middleware/auth.js';
import { validate as validateItem } from '../../common/schemas/item.js';

/**
 * Initialize the user Queue controller
 *
 * @param {Object} queue - Queue model
 * @returns {Object} Queue controller Koa router
 */
export default function controller(queue) {
  const router = new Router();

  /**
   * Process web request to Queue API
   *
   * @param {Object} ctx - Koa context object
   */
  function processRequest(ctx) {
    // the validator wants an array, I am passing a JSON string of an array so it needs to be parsed serverside
    if (ctx.request.body.medium) {
      try {
        ctx.request.body.medium = JSON.parse(ctx.request.body.medium);
      } catch (err) {
        ctx.throw(422, `Failed to parse request: ${err}`);
      }
    }

    // the validator doesn't recognize an empty string as equivalent to the field not being present
    if ('geography' in ctx.request.body) {
      if (ctx.request.body.geography === '') {
        delete ctx.request.body.geography;
      }
    }

    if (!('article' in ctx.request.body)) {
      ctx.request.body.article = {};
    }

    if (ctx.state.email) {
      if (!ctx.request.body.customer_id) {
        ctx.request.body.customer_id = ctx.state.email;
      }

      if (!ctx.request.body.title) {
        ctx.request.body.title = `Item from ${ctx.state.email}`;
      }
    }

    if (ctx.request.files) {
      const fileKeys = Object.keys(ctx.request.files);
      ctx.request.body.files = [];
      for (const key of fileKeys) {
        ctx.request.body.files.push(ctx.request.files[key]);
      }
    }

    try {
      validateItem(ctx.request.body);
    } catch (err) {
      ctx.throw(422, `Invalid item submitted ${err}`);
    }
  }

  // unauthenticated

  /**
   * Post a new item
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/items', async ctx => {
    processRequest(ctx);
    const id = await queue.enqueue({ job: ctx.request.body });
    ctx.response.body = { item_id: id };
    ctx.response.status = 201;
  });

  /**
   * Post a new item to a specific queue
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/queues/:queue/items', async ctx => {
    processRequest(ctx);
    const id = await queue.enqueue({
      queueId: ctx.params.queue,
      job: ctx.request.body,
    });
    ctx.response.body = { queue_id: ctx.params.queue, item_id: id };
    ctx.response.status = 201;
  });

  // authenticated

  /**
   * Get all items in the queue(s)
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/items', auth, async ctx => {
    let types;
    if ('types' in ctx.query) {
      types = ctx.query.types.split(',');
    }
    const jobs = await queue.list({
      types: types,
      start: ctx.query.start,
      end: ctx.query.end,
      asc: ctx.query.asc,
    });
    ctx.response.body = { jobs: jobs };
    ctx.response.status = 200;
  });

  /**
   * Get all items in a specific queue
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/queues/:queue/items', auth, async ctx => {
    let queues, types;
    if ('queues' in ctx.query) {
      queues = ctx.query.queues.split(',');
    }
    if ('types' in ctx.query) {
      types = ctx.query.types.split(',');
    }
    const jobs = await queue.list({
      queueIds: queues,
      types: types,
      start: ctx.query.start,
      end: ctx.query.end,
      asc: ctx.query.asc,
    });
    ctx.response.body = { jobs: jobs };
    ctx.response.status = 200;
  });

  return router;
}
