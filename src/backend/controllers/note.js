import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:note');

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
  author: Joi.number().integer(),
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

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

  router.get('/notes', async ctx => {
    log.debug(`Retrieving notes.`);
    let res;
    try {
      const query = await validate_query(ctx.query);
      let from, to;
      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }
      res = await notes.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        author: query.author,
      });
      ctx.response.body = {
        status: 'success',
        data: res,
        total: res.length,
      };
      ctx.response.status = 200;
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/notes/:id', async ctx => {
    log.debug(`Retrieving note ${ctx.params.id}.`);
    let note;
    try {
      note = await notes.findById(ctx.params.id);
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

      // workaround for sqlite
      if (Number.isInteger(note)) {
        note = await notes.findById(note);
      }

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
      note = await notes.delete(ctx.params.id);
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
