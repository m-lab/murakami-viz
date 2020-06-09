import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  name: Joi.string(),
  physical_address: Joi.string(),
  shipping_address: Joi.string(),
  timezone: Joi.string(),
  coordinates: Joi.object()
    .keys({
      lat: Joi.number(),
      long: Joi.number(),
    })
    .and('lat', 'long'),
  primary_contact_name: Joi.string(),
  primary_contact_email: Joi.string().email(),
  it_contact_name: Joi.string(),
  it_contact_email: Joi.string().email(),
  opening_hours: Joi.string(),
  network_name: Joi.string(),
  isp: Joi.string(),
  contracted_speed_upload: Joi.string(),
  contracted_speed_download: Joi.string(),
  ip: Joi.array().items(Joi.string().ip()),
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
