import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { BadRequestError } from '../../common/errors.js';
import {
  validateCreation,
  validateUpdate,
} from '../../common/schemas/device.js';
import { getLogger } from '../log.js';

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

  router.post('/devices', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new device.');
    let device, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      const data = await validateCreation(ctx.request.body.data);
      device = await devices.create(data, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to add device: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: device };
    ctx.response.status = 201;
  });

  router.get('/devices', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving devices.`);
    let res, library;

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

      if (ctx.params.lid) {
        library = ctx.params.lid;
      } else {
        library = query.library;
      }

      res = await devices.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        library: library,
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

  router.get('/devices/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving device ${ctx.params.id}.`);
    let device, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      device = await devices.findById(ctx.params.id, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (device.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: device };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That device with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That device with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/devices/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Updating device ${ctx.params.id}.`);
    let created, updated;

    try {
      if (ctx.params.lid) {
        await devices.addToLibrary(ctx.params.lid, ctx.params.id);
        updated = true;
      } else {
        const [data] = await validateUpdate(ctx.request.body.data);
        ({ exists: updated = false, ...created } = await devices.update(
          ctx.params.id,
          data,
        ));
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (updated) {
      ctx.response.status = 204;
    } else {
      ctx.response.body = {
        statusCode: 201,
        status: 'created',
        data: [created],
      };
      ctx.response.status = 201;
    }
  });

  router.delete(
    '/devices/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Deleting device ${ctx.params.id}.`);
      let device = 0;

      try {
        if (ctx.params.lid) {
          device = await devices.removeFromLibrary(
            ctx.params.lid,
            ctx.params.id,
          );
        } else {
          device = await devices.delete(ctx.params.id);
          log.debug('Deleted device: ', device > 0);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (device > 0) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: That device with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(404, `That device with ID ${ctx.params.id} does not exist.`);
      }
    },
  );

  return router;
}
