import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import {
  validateCreation,
  validateUpdate,
} from '../../common/schemas/glossary.js';
import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:glossary');

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
export default function controller(glossaries, thisUser) {
  const router = new Router();

  router.post('/glossaries', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new glossary.');
    let glossary;

    try {
      const data = await validateCreation(ctx.request.body.data);
      glossary = await glossaries.create(data);

      // workaround for sqlite
      if (Number.isInteger(glossary[0])) {
        glossary = await glossaries.findById(glossary[0]);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse glossary schema: ${err}`);
    }

    ctx.response.body = {
      statusCode: 201,
      status: 'created',
      data: glossary,
    };
    ctx.response.status = 201;
  });

  router.get('/glossaries', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving glossaries.`);
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
      res = await glossaries.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
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
    '/glossaries/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Retrieving glossary ${ctx.params.id}.`);
      let glossary;

      try {
        glossary = await glossaries.findById(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (glossary.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: glossary };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That glossary with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That glossary with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  router.put(
    '/glossaries/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Updating glossary ${ctx.params.id}.`);
      let updated;

      try {
        await validateUpdate(ctx.request.body.data);
        updated = await glossaries.update(ctx.params.id, ctx.request.body.data);
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
          data: { id: ctx.params.id },
        };
        ctx.response.status = 201;
      }
    },
  );

  router.delete(
    '/glossaries/:id',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Deleting glossary ${ctx.params.id}.`);
      let glossary;

      try {
        glossary = await glossaries.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (glossary > 0) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: That glossary with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That glossary with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  return router;
}
