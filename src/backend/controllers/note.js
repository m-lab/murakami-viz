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

// eslint-disable-next-line no-unused-vars
export default function controller(notes, thisUser) {
  const router = new Router();

  router.post('/notes', thisUser.can('view this library'), async ctx => {
    log.debug('Adding new note.');
    let note, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      note = await notes.create(ctx.request.body, lid);

      // workaround for sqlite
      if (Number.isInteger(note)) {
        note = await notes.findById(note);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse note schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: note };
    ctx.response.status = 201;
  });

  router.get('/notes', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving notes.`);
    let res;
    try {
      const query = await validate_query(ctx.query);
      let from, to;

      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
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
        library: ctx.params.lid,
      });
      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: res,
      };
      ctx.response.status = 200;
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/notes/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving note ${ctx.params.id}.`);
    let note;

    try {
      note = await notes.findById(ctx.params.id);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (note.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: note };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That note with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That note with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/notes/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Updating note ${ctx.params.id}.`);
    let note;

    try {
      if (ctx.params.lid) {
        note = await notes.addToLibrary(ctx.params.lid, ctx.params.id);
      } else {
        note = await notes.update(ctx.params.id, ctx.request.body);
      }

      // workaround for sqlite
      if (Number.isInteger(note)) {
        note = await notes.findById(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (note.length && note.length > 0) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: note };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That note with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That note with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.delete('/notes/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Deleting note ${ctx.params.id}.`);
    let note;

    try {
      if (ctx.params.lid) {
        note = await notes.removeFromLibrary(ctx.params.lid, ctx.params.id);
      } else {
        note = await notes.delete(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (note.length && note.length > 0) {
      ctx.response.body = { status: 'success', data: note };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That note with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That note with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
