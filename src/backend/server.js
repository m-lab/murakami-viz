import path from 'path';
import Koa from 'koa';
import compose from 'koa-compose';
import cors from '@koa/cors';
import log4js from 'koa-log4';
import bodyParser from 'koa-body';
import flash from 'koa-better-flash';
import mount from 'koa-mount';
import serveStatic from 'koa-static';
import session from 'koa-session';
import passport from 'koa-passport';
import koa404handler from 'koa-404-handler';
import errorHandler from 'koa-better-error-handler';
import db from './db.js';
import authHandler from './middleware/auth.js';
import cloudflareAccess from './middleware/cloudflare.js';
import currentLibrary from './middleware/library.js';
//import ssr from './middleware/ssr.js';
import UserController from './controllers/user.js';
import GroupController from './controllers/group.js';
import LibraryController from './controllers/library.js';
import DeviceController from './controllers/device.js';
import NoteController from './controllers/note.js';
import RunController from './controllers/run.js';
import SettingController from './controllers/setting.js';
import SystemController from './controllers/system.js';
import Libraries from './models/library.js';
import Devices from './models/device.js';
import Notes from './models/note.js';
import Runs from './models/run.js';
import Settings from './models/setting.js';
import Systems from './models/system.js';
import Users from './models/user.js';
import Groups from './models/group.js';

const __dirname = path.resolve();
const STATIC_DIR = path.resolve(__dirname, 'dist', 'frontend');
//const ENTRYPOINT = path.resolve(STATIC_DIR, 'index.html');

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

  const log = log4js.getLogger('backend:server');

  // Setup our authentication middleware
  const groupModel = new Groups(db);
  const libraryModel = new Libraries(db);
  server.use(currentLibrary());
  const auth = authHandler(groupModel, libraryModel);
  server.use(auth.middleware());

  // Setup our API handlers
  const userModel = new Users(db);
  const users = UserController(userModel, auth);
  const groups = GroupController(groupModel, auth);
  const deviceModel = new Devices(db);
  const devices = DeviceController(deviceModel, auth);
  const noteModel = new Notes(db);
  const notes = NoteController(noteModel, auth);
  const runModel = new Runs(db);
  const runs = RunController(runModel, auth);
  const settingModel = new Settings(db);
  const settings = SettingController(settingModel, auth);
  const systemModel = new Systems(db);
  const systems = SystemController(systemModel, auth);
  const libraries = LibraryController(libraryModel, auth);
  libraries.use('/libraries/:lid', devices.routes(), devices.allowedMethods());
  libraries.use('/libraries/:lid', notes.routes(), notes.allowedMethods());
  libraries.use('/libraries/:lid', runs.routes(), runs.allowedMethods());
  libraries.use('/libraries/:lid', users.routes(), users.allowedMethods());
  const apiV1Router = compose([
    users.routes(),
    users.allowedMethods(),
    groups.routes(),
    groups.allowedMethods(),
    libraries.routes(),
    libraries.allowedMethods(),
    devices.routes(),
    devices.allowedMethods(),
    notes.routes(),
    notes.allowedMethods(),
    runs.routes(),
    runs.allowedMethods(),
    settings.routes(),
    settings.allowedMethods(),
    systems.routes(),
    systems.allowedMethods(),
  ]);

  // Set session secrets
  server.keys = Array.isArray(config.secrets)
    ? config.secrets
    : [config.secrets];

  // Set custom error handler
  server.context.onerror = errorHandler;

  // Specify that this is our backend API (for better-errror-handler)
  // server.context.api = true;

  // If we're running behind Cloudflare, set the access parameters.
  if (config.cfaccess_url) {
    server.use(async (ctx, next) => {
      let cfa = await cloudflareAccess();
      await cfa(ctx, next);
    });
    server.use(async (ctx, next) => {
      let email = ctx.request.header['cf-access-authenticated-user-email'];
      if (!email) {
        if (!config.isDev && !config.isTest) {
          ctx.throw(401, 'Missing header cf-access-authenticated-user-email');
        } else {
          email = 'foo@example.com';
        }
      }
      ctx.state.email = email;
      await next();
    });
  }

  if (config.proxy) {
    server.proxy = true;
  } else {
    log.warn('Disable proxy header support.');
  }

  server
    .use(bodyParser({ multipart: true, json: true }))
    .use(session(server))
    .use(koa404handler)
    .use(flash())
    .use(passport.initialize())
    .use(passport.session())
    .use(cors())
    .use(
      mount('/admin', async (ctx, next) => {
        if (ctx.isAuthenticated()) {
          log.debug('Admin is authenticated.');
          await next();
        } else {
          log.debug('Admin is NOT authenticated.');
          ctx.throw(401, 'Authentication failed.');
        }
      }),
    )
    .use(mount('/api/v1', apiV1Router))
    .use(mount('/static', serveStatic(STATIC_DIR)))
    .use(
      async (ctx, next) =>
        await serveStatic(STATIC_DIR)(
          Object.assign(ctx, { path: 'index.html' }),
          next,
        ),
    );
  return server.callback();
}
