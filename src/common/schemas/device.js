import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  name: Joi.string(),
  network_type: Joi.string(),
  connection_type: Joi.string(),
  dns_server: Joi.string().ip(),
  ip: Joi.string().ip(),
  gateway: Joi.string().ip(),
  mac: Joi.string().pattern(
    /^[0-9a-f]{1,2}([.:-])[0-9a-f]{1,2}(?:\1[0-9a-f]{1,2}){4}$/,
  ),
  created_at: Joi.string(),
  updated_at: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
