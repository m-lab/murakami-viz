import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:library');

export default function controller(libraries) {
  const router = new Router();

  router.post('/libraries', async ctx => {
    log.debug('Adding new library.');
    let library;
    try {
      library = await libraries.create(ctx.request.body);
    } catch (err) {
      ctx.throw(400, `Failed to parse library schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: library };
    ctx.response.status = 201;
  });

  router.get('/libraries/:id', async ctx => {
    log.debug(`Retrieving library ${ctx.params.id}.`);
    let library;
    try {
      library = libraries.getById(ctx.params.id);
      if (library.length) {
        ctx.response.body = { status: 'success', data: library };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That library with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/libraries/:id', async ctx => {
    log.debug(`Updating library ${ctx.params.id}.`);
    let library;
    try {
      library = await libraries.update(ctx.params.id, ctx.request.body);
      if (library.length) {
        ctx.response.body = { status: 'success', data: library };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That library with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/libraries/:id', async ctx => {
    log.debug(`Deleting library ${ctx.params.id}.`);
    let library;
    try {
      library = libraries.delete(ctx.params.id);
      if (library.length) {
        ctx.response.body = { status: 'success', data: library };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That library with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });
}
