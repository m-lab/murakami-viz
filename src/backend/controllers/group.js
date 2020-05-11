import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:group');

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

/**
 * Initialize the group auth controller
 *
 * @param {Object} groups - User model
 * @returns {Object} Auth controller Koa router
 */
// eslint-disable-next-line no-unused-vars
export default function controller(groups, thisUser) {
  const router = new Router();

  router.post('/groups', async ctx => {
    log.debug('Adding new group.');
    let group;
    try {
      group = await groups.create(ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(group)) {
        group = await groups.findById(group);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse group schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: group };
    ctx.response.status = 201;
  });

  router.get('/groups', async ctx => {
    log.debug(`Retrieving groups.`);
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
      res = await groups.find({
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

  router.get('/groups/:id', async ctx => {
    log.debug(`Retrieving group ${ctx.params.id}.`);
    let group;
    try {
      group = await groups.findById(ctx.params.id);
      if (group.length) {
        ctx.response.body = { status: 'success', data: group };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That group with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/groups/:id', async ctx => {
    log.debug(`Updating group ${ctx.params.id}.`);
    let group;
    try {
      group = await groups.update(ctx.params.id, ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(group)) {
        group = await groups.findById(group);
      }

      if (group.length) {
        ctx.response.body = { status: 'success', data: group };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That group with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/groups/:id', async ctx => {
    log.debug(`Deleting group ${ctx.params.id}.`);
    let group;
    try {
      group = await groups.delete(ctx.params.id);
      if (group.length) {
        ctx.response.body = { status: 'success', data: group };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That group with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/groups/:id/members', async ctx => {
    log.debug(`Retrieving members of group ${ctx.params.id}.`);
    let group;
    try {
      const query = await validate_query(ctx.query);
      group = await groups.members({
        gid: ctx.params.id,
        start: query.start,
        end: query.end,
        asc: query.asc,
      });
      if (group.length) {
        ctx.response.body = { status: 'success', data: group };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That group with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.post('/groups/:id/members/:uid', async ctx => {
    log.debug(`Adding user ${ctx.params.uid} to group ${ctx.params.id}.`);
    let res;
    try {
      res = await groups.memberAdd(ctx.params.id, ctx.params.uid);
      if (res) {
        ctx.response.body = { status: 'success', data: res };
        ctx.response.status = 201;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
    ctx.response.body = { status: 'success', data: res };
    ctx.response.status = 201;
  });

  router.delete('/groups/:id/members/:uid', async ctx => {
    log.debug(`Removing user ${ctx.params.uid} from group ${ctx.params.id}.`);
    let res;
    try {
      res = await groups.memberRemove(ctx.params.id, ctx.params.uid);
      if (res) {
        ctx.response.body = { status: 'success', data: res };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
