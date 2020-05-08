import { Command } from 'commander';
import Joi from '@hapi/joi';
import dotenv from 'dotenv';

/**
 * Optionally load environment from a .env file.
 */

dotenv.config();

const defaults = {
  loglevel: process.env.MURAKAMI_VIZ_LOG_LEVEL || 'error',
  cfaccess: {
    client_id: process.env.MURAKAMI_VIZ_CFACCESS_CLIENT_ID,
    client_secret: process.env.MURAKAMI_VIZ_CFACCESS_CLIENT_SECRET,
  },
};

// eslint-disable-next-line no-unused-vars
function validateUrl(value, previous) {
  const url = value ? value : previous;
  Joi.assert(url, Joi.string().uri());
  return url;
}

function validateToken(value, previous) {
  const token = value ? value : previous;
  Joi.assert(token, Joi.string().required());
  return token;
}

function validateLoglevel(value, previous) {
  const level = value ? value : previous;
  Joi.assert(
    level,
    Joi.string()
      .allow('trace', 'debug', 'info', 'warn', 'error', 'fatal')
      .required(),
  );
  return level;
}

// eslint-disable-next-line no-unused-vars
function validateHost(value, previous) {
  const host = value ? value : previous;
  Joi.assert(host, Joi.string().required());
  return host;
}

// eslint-disable-next-line no-unused-vars
function validatePort(value, previous) {
  const port = value ? value : previous;
  Joi.assert(port, Joi.number().required());
  return port;
}

// eslint-disable-next-line no-unused-vars
function validateQueueId(value, previous) {
  const id = value ? value : previous;
  Joi.assert(id, Joi.string().required());
  return id;
}

class Config extends Command {
  constructor(...args) {
    super(args);
    const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    Joi.string()
      .allow('development', 'production', 'test')
      .required()
      .validate(env);
    this.isDev = env === 'development';
    this.isTest = env === 'test';
    this.isProd = env === 'production';
  }
}

const program = new Config();

export default program
  .description(process.env.npm_package_description)
  .version(process.env.npm_package_version)
  .option(
    '-l, --log_level <level>',
    'Logging verbosity',
    validateLoglevel,
    defaults.loglevel,
  )
  .option(
    '--cfaccess_client_id <id>',
    'Cloudflare Access client ID',
    validateToken,
    defaults.cfaccess.client_id,
  )
  .option(
    '--cfaccess_client_secret <secret>',
    'Cloudflare Access client secret',
    validateToken,
    defaults.cfaccess.client_secret,
  );
