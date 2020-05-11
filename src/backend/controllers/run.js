import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

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

  router.post('/runs', async ctx => {
    log.debug('Adding new run.');
    let run;
    try {
      run = await runs.create(ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(run)) {
        run = await runs.findById(run);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse run schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: run };
    ctx.response.status = 201;
  });

  router.get('/runs', async ctx => {
    log.debug(`Retrieving runs.`);
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
      res = await runs.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        test: query.test,
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

  router.get('/runs/:id', async ctx => {
    log.debug(`Retrieving run ${ctx.params.id}.`);
    let run;
    try {
      run = await runs.findById(ctx.params.id);
      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/runs/:id', async ctx => {
    log.debug(`Updating run ${ctx.params.id}.`);
    let run;
    try {
      run = await runs.update(ctx.params.id, ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(run)) {
        run = await runs.findById(run);
      }

      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/runs/:id', async ctx => {
    log.debug(`Deleting run ${ctx.params.id}.`);
    let run;
    try {
      run = await runs.delete(ctx.params.id);
      if (run.length) {
        ctx.response.body = { status: 'success', data: run };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That run with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
