import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  name: Joi.string().required(),
  physical_address: Joi.string().required(),
  shipping_address: Joi.string().required(),
  timezone: Joi.string().required(),
  coordinates: Joi.object()
    .keys({
      lat: Joi.number(),
      long: Joi.number(),
    })
    .and('lat', 'long')
    .required(),
  primary_contact_name: Joi.string().required(),
  primary_contact_email: Joi.string()
    .email()
    .required(),
  it_contact_name: Joi.string().required(),
  it_contact_email: Joi.string()
    .email()
    .required(),
  opening_hours: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
