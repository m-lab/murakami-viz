import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

// TODO: includes ndt5 & ndt7 fields, add from DASH & speedtest-cli after feedback
const schema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
    }),
  )
  .min(1);

export async function validate(data) {
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
