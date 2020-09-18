import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  name: Joi.string().required(),
  isp: Joi.string(),
  contracted_speed_upload: Joi.string(),
  contracted_speed_download: Joi.string(),
  bandwidth_cap_upload: Joi.string(),
  bandwidth_cap_download: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
