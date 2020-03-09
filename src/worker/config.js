import Joi from 'joi';
import dotenv from 'dotenv';
import { ServerError } from '../common/errors.js';

/**
 * Generate a validation schema using Joi to check the type of your environment variables
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().allow(['development', 'production', 'test']),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  WORKER_QUEUE: Joi.string(),
})
  .unknown()
  .required();

/**
 * Optionally load environment from a .env file.
 */

dotenv.config();

/**
 * Validate the env variables using Joi.validate()
 */
const { error, value: envVars } = Joi.validate(process.env, envSchema);
if (error) {
  throw new ServerError('Config validation error', error);
}

export default {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  redis: {
    host: envVars.REDIS_HOST || 'localhost',
    port: envVars.REDIS_PORT || 6379,
  },
  worker: {
    queue: envVars.WORKER_QUEUE || '0',
  },
};
