import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const creationSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      isp: Joi.string(),
      ips: Joi.array().items(Joi.string().ip()),
      contracted_speed_upload: Joi.string(),
      contracted_speed_download: Joi.string(),
      bandwidth_cap_upload: Joi.string(),
      bandwidth_cap_download: Joi.string(),
    }),
  )
  .min(1);

const updateSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      isp: Joi.string(),
      ips: Joi.array().items(Joi.string().ip()),
      contracted_speed_upload: Joi.string(),
      contracted_speed_download: Joi.string(),
      bandwidth_cap_upload: Joi.string(),
      bandwidth_cap_download: Joi.string(),
    }),
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
