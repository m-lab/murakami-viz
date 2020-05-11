import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

// TODO: includes ndt5 & ndt7 fields, add from DASH & speedtest-cli after feedback
const schema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
