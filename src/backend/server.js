import path from 'path';
import Koa from 'koa';
import compose from 'koa-compose';
import cors from '@koa/cors';
import log4js from 'koa-log4';
import bodyParser from 'koa-body';
import mount from 'koa-mount';
import serveStatic from 'koa-static';
import session from 'koa-session';
import passport from 'koa-passport';
import errorHandler from 'koa-better-error-handler';
import cloudflareAccess from './middleware/cloudflare.js';
import ssr from './middleware/ssr.js';
import AuthController from './controllers/auth.js';
// import HostController from './controllers/host.js';
import QueueController from './controllers/queue.js';
// import Hosts from './models/host.js';
import Queue from './models/queue.js';
import UserModel from './models/user.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');
const ENTRYPOINT = path.resolve(STATIC_DIR, 'index.html');

export default function configServer(config) {
  // Initialize our application server
  const server = new Koa();

  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.log_level },
    },
  });
  server.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }));

  // Setup our API handlers
  const users = new UserModel();
  const auth = AuthController(users);
  // const hosts = new Hosts(config.redis_host, config.redis_port);
  // const mapping = HostController(hosts);
  const queue = QueueController(
    new Queue(config.redis_host, config.redis_port),
  );
  const apiV1Router = compose([
    auth.routes(),
    auth.allowedMethods(),
    // mapping.routes(),
    // mapping.allowedMethods(),
    queue.routes(),
    queue.allowedMethods(),
  ]);

  // Set session secrets
  server.keys = Array.isArray(config.secrets)
    ? config.secrets
    : [config.secrets];

  // Set custom error handler
  server.context.onerror = errorHandler;

  // If we're running behind Cloudflare, set the access parameters.
  if (!!config.cfaccess_url) {
    server.use(cloudflareAccess(config.cfaccess_url, config.cfaccess_audience));
    if (!config.isDev && !config.isTest) {
      server.use(async (ctx, next) => {
        const email = ctx.request.header['cf-access-authenticated-user-email'];
        if (!email) {
          ctx.throw(401, 'Missing header cf-access-authenticated-user-email');
        }
        ctx.state.email = email;
        await next();
      });
    }
  }

  server
    .use(bodyParser({ multipart: true, json: true }))
    .use(session(server))
    .use(passport.initialize())
    .use(passport.session())
    .use(cors())
    .use(
      mount('/admin', async (ctx, next) => {
        if (ctx.isAuthenticated()) {
          console.debug('admin is authenticated.');
          await next();
        } else {
          console.debug('admin is NOT authenticated.');
          ctx.throw(401, 'Authentication failed.');
        }
      }),
    )
    .use(mount('/api/v1', apiV1Router))
    .use(mount('/static', serveStatic(STATIC_DIR)))
    .use((ctx, next) => {
      ctx.state.htmlEntrypoint = ENTRYPOINT;
      ssr(ctx, next);
    });
  return server.callback();
}
