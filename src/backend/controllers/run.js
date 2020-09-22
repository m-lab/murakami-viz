import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { BadRequestError } from '../../common/errors.js';
import { validateCreation, validateUpdate } from '../../common/schemas/run.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:run');

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
  test: Joi.string(),
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
export default function controller(runs, thisUser) {
  const router = new Router();

  router.post('/runs', thisUser.can('write from whitelisted IP'), async ctx => {
    log.debug('Adding new run.');
    let run, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      const data = await validateCreation(ctx.request.body.data);
      run = await runs.create(data, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse run schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: run };
    ctx.response.status = 201;
  });

  router.get('/runs', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving runs.`);
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

      res = await runs.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        test: query.test,
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

  router.get('/runs/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving run ${ctx.params.id}.`);
    let run, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      run = await runs.findById(ctx.params.id, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (run.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: run };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That run with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That run with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/runs/:id', thisUser.can('edit this library'), async ctx => {
    log.debug(`Updating run ${ctx.params.id}.`);
    let created, updated;

    try {
      const [data] = await validateUpdate(ctx.request.body.data);
      ({ exists: updated = false, ...created } = await runs.update(
        ctx.params.id,
        data,
      ));
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

  router.delete('/runs/:id', thisUser.can('edit this library'), async ctx => {
    log.debug(`Deleting run ${ctx.params.id}.`);
    let run;
    try {
      if (ctx.params.lid) {
        run = await runs.removeFromLibrary(ctx.params.lid, ctx.params.id);
      } else {
        run = await runs.delete(ctx.params.id);
        log.debug('Deleted run: ', run > 0);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (run > 0) {
      ctx.response.status = 204;
    } else {
      log.error(
        `HTTP 404 Error: That run with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That run with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
