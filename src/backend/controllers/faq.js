import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:faq');

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
export default function controller(faqs, thisUser) {
  const router = new Router();

  router.post('/faqs', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new faq.');
    let faq;

    try {
      faq = await faqs.create(ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(faq)) {
        faq = await faqs.findById(faq);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse faq schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: faq };
    ctx.response.status = 201;
  });

  router.get('/faqs', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving faqs.`);
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
      res = await faqs.find({
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

  router.get('/faqs/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving faq ${ctx.params.id}.`);
    let faq;

    try {
      faq = await faqs.findById(ctx.params.id);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (faq.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: faq };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That faq with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That faq with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/faqs/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Updating faq ${ctx.params.id}.`);
    let faq;

    try {
      faq = await faqs.update(ctx.params.id, ctx.request.body.data);

      // workaround for sqlite
      if (Number.isInteger(faq)) {
        faq = await faqs.findById(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (faq.length && faq.length > 0) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: faq };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That faq with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That faq with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.delete('/faqs/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Deleting faq ${ctx.params.id}.`);
    let faq;

    try {
      faq = await faqs.delete(ctx.params.id);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (faq.length && faq.length > 0) {
      ctx.response.body = { status: 'success', data: faq };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That faq with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That faq with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
