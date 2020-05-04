import path from 'path';
import pg from 'pg';
import range from 'pg-range';
range.install(pg);

const __dirname = path.resolve();
const BASE_PATH = path.normalize(path.join(__dirname, 'src', 'backend'));
const DB_PATH = path.join(BASE_PATH, 'db');

import config from './src/backend/config.js';

const _migrations = {
  tableName: 'knex_migrations',
  directory: path.join(DB_PATH, 'migrations'),
};

const _seeds = {
  directory: path.normalize(path.join(DB_PATH, 'seeds', config.env)),
};

var env;
if (config.isDev) {
  console.log('Loading development database settings...');
  env = {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    debug: true,
    migrations: _migrations,
    seeds: _seeds,
  };
} else {
  console.log('Loading database settings...');
  const isDebug = config.log_level === 'debug';

  // Needed sometimes when connecting to Heroku locally
  // Tip from https://www.shanestillwell.com/2018/06/29/setting-up-knex-project/
  if (/sslmode=require/.test(config.dbUrl)) {
    pg.defaults.ssl = true;
  }

  env = {
    client: 'pg',
    connection: config.dbUrl,
    pool: {
      min: config.dbPoolMin,
      max: config.dbPoolMax,
    },
    acquireConnectionTimeout: config.dbTimeout,
    debug: isDebug,
    migrations: _migrations,
    seeds: _seeds,
  };
}

export const {
  client,
  connection,
  pool,
  acquireConnectionTimeout,
  debug,
  migrations,
  seeds,
} = env;
