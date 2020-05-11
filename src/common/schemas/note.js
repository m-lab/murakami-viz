import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  id: Joi.number(),
  author: Joi.string(),
  subject: Joi.string(),
  description: Joi.string(),
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
