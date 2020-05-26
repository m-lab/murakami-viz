import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:device');

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
  library: Joi.number().integer(),
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
export default function controller(devices, thisUser) {
  const router = new Router();

  router.post('/devices', async ctx => {
    log.debug('Adding new device.');
    let device;
    try {
      device = await devices.create(ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(device)) {
        device = await devices.findById(device);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse device schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: device };
    ctx.response.status = 201;
  });

  router.get('/devices', async ctx => {
    log.debug(`Retrieving devices.`);
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
      res = await devices.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        library: query.library,
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

  router.get('/devices/:id', async ctx => {
    log.debug(`Retrieving device ${ctx.params.id}.`);
    let device;
    try {
      device = await devices.findById(ctx.params.id);
      if (device.length) {
        ctx.response.body = { status: 'success', data: device };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That device with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/devices/:id', async ctx => {
    log.debug(`Updating device ${ctx.params.id}.`);
    let device;
    try {
      device = await devices.update(ctx.params.id, ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(device)) {
        device = await devices.findById(device);
      }

      if (device.length) {
        ctx.response.body = { status: 'success', data: device };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That device with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/devices/:id', async ctx => {
    log.debug(`Deleting device ${ctx.params.id}.`);
    let device;
    try {
      device = await devices.delete(ctx.params.id);
      if (device.length) {
        ctx.response.body = { status: 'success', data: device };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That device with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
