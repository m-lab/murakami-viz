import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Router from '@koa/router';
import auth from '../middleware/auth.js';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import moment from 'moment';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:note');

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
 * Initialize the user auth controller
 *
 * @param {Object} users - User model
 * @returns {Object} Auth controller Koa router
 */
export default function controller(users) {
  const router = new Router();

  /**
   * Serialize user
   *
   * @param {Object} user - User info
   * @param {function} done - 'Done' callback
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session
   *
   * @param {integer} id - User id
   * @param {function} done - 'Done' callback
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await users.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  /**
   * Initialize passport strategy
   *
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {function} done - 'Done' callback
   */
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await users.findByUsername(username);
        if (username === user.username && password === user.password) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (err) {
        done(err);
      }
    }),
  );

  /**
   * Login user.
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/login', async ctx => {
    return passport.authenticate('local', (err, user) => {
      if (!user) {
        ctx.body = { success: false };
        ctx.throw(401, 'Authentication failed.');
      } else {
        if (ctx.request.body.remember === 'true') {
          ctx.session.maxAge = 86400000; // 1 day
        } else {
          ctx.session.maxAge = 'session';
        }
        ctx.body = { success: true };
        return ctx.login(user);
      }
    })(ctx);
  });

  /**
   * Logout user.
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/logout', async ctx => {
    if (ctx.isAuthenticated()) {
      await ctx.logout();
      ctx.session = null;
      ctx.redirect('/');
    } else {
      ctx.body = { success: false };
      ctx.throw(401, 'Logout failed.');
    }
  });

  /**
   * Authentication required
   *
   * @param {Object} auth - Authentication middleware
   * @param {Object} ctx - Koa context object
   */
  router.get('/authenticated', auth, async ctx => {
    ctx.body = { msg: 'Authenticated', user: ctx.state.user };
  });

  /**
   * Get all users.
   *
   * @param {Object} auth - Authentication middleware
   * @param {Object} ctx - Koa context object
   */
   router.get('/users', async ctx => {
     log.debug(`Retrieving users.`);
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
       res = await users.find({
         start: query.start,
         end: query.end,
         asc: query.asc,
         sort_by: query.sort_by,
         from: from,
         to: to,
         author: query.author,
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

  /**
   * Get single user
   *
   * @param integer
   * @returns object|null 	User object or null
   */
  router.get('/users/:id', auth, async (ctx, next) => {
    const user = await users.findById(ctx.params.id);
    if (user) {
      ctx.body = user;
    } else {
      ctx.status = 404;
      ctx.body = `User with id ${ctx.params.id} was not found.`;
    }
    await next();
  });

  return router;
}
