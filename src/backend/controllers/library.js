import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:library');

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
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

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

  router.get('/libraries', async ctx => {
    log.debug(`Retrieving libraries.`);
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
      res = await libraries.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
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

  router.get('/libraries/:id', async ctx => {
    log.debug(`Retrieving library ${ctx.params.id}.`);
    let library;
    try {
      library = await libraries.findById(ctx.params.id);
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

      // workaround for sqlite
      if (Number.isInteger(library)) {
        library = await libraries.findById(library);
      }

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
      library = await libraries.delete(ctx.params.id);
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

  return router;
}
