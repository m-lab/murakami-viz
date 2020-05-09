import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:note');

export default function controller(notes) {
  const router = new Router();

  router.post('/notes', async ctx => {
    log.debug('Adding new note.');
    let note;
    try {
      note = await notes.create(ctx.request.body);
    } catch (err) {
      ctx.throw(400, `Failed to parse note schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: note };
    ctx.response.status = 201;
  });

  router.get('/notes/:id', async ctx => {
    log.debug(`Retrieving note ${ctx.params.id}.`);
    let note;
    try {
      note = notes.getById(ctx.params.id);
      if (note.length) {
        ctx.response.body = { status: 'success', data: note };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That note with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/notes/:id', async ctx => {
    log.debug(`Updating note ${ctx.params.id}.`);
    let note;
    try {
      note = await notes.update(ctx.params.id, ctx.request.body);
      if (note.length) {
        ctx.response.body = { status: 'success', data: note };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That note with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/notes/:id', async ctx => {
    log.debug(`Deleting note ${ctx.params.id}.`);
    let note;
    try {
      note = notes.delete(ctx.params.id);
      if (note.length) {
        ctx.response.body = { status: 'success', data: note };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That note with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
