import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:system');

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

// eslint-disable-next-line no-unused-vars
export default function controller(systems, thisUser) {
  const router = new Router();

  router.post('/systems', async ctx => {
    log.debug('Adding new system.');
    let system;
    try {
      system = await systems.create(ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(system)) {
        system = await systems.findById(system);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse system schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: system };
    ctx.response.status = 201;
  });

  router.get('/systems', async ctx => {
    log.debug(`Retrieving systems.`);
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
      res = await systems.find({
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

  router.get('/systems/:id', async ctx => {
    log.debug(`Retrieving system ${ctx.params.id}.`);
    let system;
    try {
      system = await systems.findById(ctx.params.id);
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
      system = await systems.update(ctx.params.id, ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(system)) {
        system = await systems.findById(system);
      }

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
      system = await systems.delete(ctx.params.id);
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
