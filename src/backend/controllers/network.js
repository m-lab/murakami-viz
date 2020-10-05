import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:network');

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
export default function controller(networks, thisUser) {
  const router = new Router();

  router.post('/networks', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new network.');
    let network, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      network = await networks.create(ctx.request.body.data, lid);

      // workaround for sqlite
      if (Number.isInteger(network)) {
        network = await networks.findById(network);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to add network: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: network };
    ctx.response.status = 201;
  });

  router.get('/networks', async ctx => {
    log.debug(`Retrieving networks.`);
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

      res = await networks.find({
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

  router.get(
    '/networks/:id',
    thisUser.can('access private pages'),
    async ctx => {
      log.debug(`Retrieving network ${ctx.params.id}.`);
      let network, lid;

      if (ctx.params.lid) {
        lid = ctx.params.lid;
      }

      try {
        network = await networks.findById(ctx.params.id, lid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (network.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: network };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That network with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(404, `That network with ID ${ctx.params.id} does not exist.`);
      }
    },
  );

  router.put('/networks/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Updating network ${ctx.params.id}.`);
    let network = [];

    try {
      if (ctx.params.lid) {
        network = await networks.addToLibrary(ctx.params.lid, ctx.params.id);
      } else {
        network = await networks.update(ctx.params.id, ctx.request.body.data);
      }
      // workaround for sqlite
      if (Number.isInteger(network)) {
        network = await networks.findById(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (network.length && network.length > 0) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: network };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That network with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That network with ID ${ctx.params.id} does not exist.`);
      ctx.response.body = { error: 'Please try again.' };
    }
  });

  router.delete(
    '/networks/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Deleting network ${ctx.params.id}.`);
      let network = 0;

      try {
        if (ctx.params.lid) {
          network = await networks.removeFromLibrary(
            ctx.params.lid,
            ctx.params.id,
          );
        } else {
          network = await networks.delete(ctx.params.id);
          log.debug('Deleted network: ', network);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (network > 0) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: network };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That network with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(404, `That network with ID ${ctx.params.id} does not exist.`);
      }
    },
  );

  return router;
}
