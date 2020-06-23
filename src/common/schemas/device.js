import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const creationSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      network_type: Joi.string(),
      connection_type: Joi.string(),
      dns_server: Joi.string().ip(),
      ip: Joi.string().ip(),
      gateway: Joi.string().ip(),
      deviceid: Joi.string().required(),
      mac: Joi.string().pattern(
        /^[0-9a-fA-F]{1,2}([.:-])[0-9a-fA-F]{1,2}(?:\1[0-9a-fA-F]{1,2}){4}$/,
      ),
    }),
  )
  .min(1);

const updateSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string(),
      network_type: Joi.string(),
      connection_type: Joi.string(),
      dns_server: Joi.string().ip(),
      ip: Joi.string().ip(),
      gateway: Joi.string().ip(),
      deviceid: Joi.string(),
      mac: Joi.string().pattern(
        /^[0-9a-fA-F]{1,2}([.:-])[0-9a-fA-F]{1,2}(?:\1[0-9a-fA-F]{1,2}){4}$/,
      ),
    }).min(1),
  )
  .min(1);

export async function validateCreation(data) {
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await creationSchema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate JSON: ', err);
  }
}

export async function validateUpdate(data) {
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await updateSchema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate JSON: ', err);
  }
}
