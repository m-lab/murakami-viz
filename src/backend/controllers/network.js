import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';
import {
  validateCreation,
  validateUpdate
} from '../../common/schemas/network.js';

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
     const data = await validateCreation(ctx.request.body.data);
     network = await networks.create(
       [{ ...data[0], ips: data[0].ips.join(', ') }], // turning the array of IPs into a string of IPs to insert to the DB 
       lid,
     );
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
    let created, updated;

    // this is a workaround
    delete ctx.request.body.data['id'];

    try {
      if (ctx.params.lid) {
        await networks.addToLibrary(ctx.params.lid, ctx.params.id);
        updated = true;
      } else {
        const [data] = await validateUpdate(ctx.request.body.data);
        ({ exists: updated = false, ...created } = await networks.update(
          ctx.params.id,
          { ...data, ips: data.ips.join(', ') }, // as with the POST route, this changes the array of IPs into a string of IPs to insert to the DB
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
