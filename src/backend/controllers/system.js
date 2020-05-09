import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:system');

export default function controller(systems) {
  const router = new Router();

  router.post('/systems', async ctx => {
    log.debug('Adding new system.');
    let system;
    try {
      system = await systems.create(ctx.request.body);
    } catch (err) {
      ctx.throw(400, `Failed to parse system schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: system };
    ctx.response.status = 201;
  });

  router.get('/systems/:id', async ctx => {
    log.debug(`Retrieving system ${ctx.params.id}.`);
    let system;
    try {
      system = systems.getById(ctx.params.id);
      if (system.length) {
        ctx.response.body = { status: 'success', data: system };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That system with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/systems/:id', async ctx => {
    log.debug(`Updating system ${ctx.params.id}.`);
    let system;
    try {
      system = await systems.update(ctx.params.id, ctx.request.body);
      if (system.length) {
        ctx.response.body = { status: 'success', data: system };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That system with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/systems/:id', async ctx => {
    log.debug(`Deleting system ${ctx.params.id}.`);
    let system;
    try {
      system = systems.delete(ctx.params.id);
      if (system.length) {
        ctx.response.body = { status: 'success', data: system };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That system with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
