import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:run');

export default function controller(runs) {
  const router = new Router();

  router.post('/runs', async ctx => {
    log.debug('Adding new run.');
    let run;
    try {
      run = await runs.create(ctx.request.body);
    } catch (err) {
      ctx.throw(400, `Failed to parse run schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: run };
    ctx.response.status = 201;
  });

  router.get('/runs/:id', async ctx => {
    log.debug(`Retrieving run ${ctx.params.id}.`);
    let run;
    try {
      run = runs.getById(ctx.params.id);
      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/runs/:id', async ctx => {
    log.debug(`Updating run ${ctx.params.id}.`);
    let run;
    try {
      run = await runs.update(ctx.params.id, ctx.request.body);
      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/runs/:id', async ctx => {
    log.debug(`Deleting run ${ctx.params.id}.`);
    let run;
    try {
      run = runs.delete(ctx.params.id);
      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
