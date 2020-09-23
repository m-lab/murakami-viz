import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const creationSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string(),
      physical_address: Joi.string(),
      shipping_address: Joi.string(),
      timezone: Joi.string(),
      coordinates: Joi.string(),
      //coordinates: Joi.object()
      //  .keys({
      //    lat: Joi.number(),
      //    long: Joi.number(),
      //  })
      //  .and('lat', 'long'),
      primary_contact_name: Joi.string(),
      primary_contact_email: Joi.string().email(),
      it_contact_name: Joi.string(),
      it_contact_email: Joi.string().email(),
      sunday_open: Joi.string(),
      sunday_close: Joi.string(),
      monday_open: Joi.string(),
      monday_close: Joi.string(),
      tuesday_open: Joi.string(),
      tuesday_close: Joi.string(),
      wednesday_open: Joi.string(),
      wednesday_close: Joi.string(),
      thursday_open: Joi.string(),
      thursday_close: Joi.string(),
      friday_open: Joi.string(),
      friday_close: Joi.string(),
      saturday_open: Joi.string(),
      saturday_close: Joi.string(),
      network_name: Joi.string(),
      isp: Joi.string(),
      contracted_speed_upload: Joi.string(),
      contracted_speed_download: Joi.string(),
      ip: Joi.array().items(Joi.string().ip()),
      bandwidth_cap_upload: Joi.string(),
      bandwidth_cap_download: Joi.string(),
    }),
  )
  .min(1);

const updateSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string(),
      physical_address: Joi.string(),
      shipping_address: Joi.string(),
      timezone: Joi.string(),
      coordinates: Joi.string(),
      //coordinates: Joi.object()
      //  .keys({
      //    lat: Joi.number(),
      //    long: Joi.number(),
      //  })
      //  .and('lat', 'long'),
      primary_contact_name: Joi.string(),
      primary_contact_email: Joi.string().email(),
      it_contact_name: Joi.string(),
      it_contact_email: Joi.string().email(),
      sunday_open: Joi.string(),
      sunday_close: Joi.string(),
      monday_open: Joi.string(),
      monday_close: Joi.string(),
      tuesday_open: Joi.string(),
      tuesday_close: Joi.string(),
      wednesday_open: Joi.string(),
      wednesday_close: Joi.string(),
      thursday_open: Joi.string(),
      thursday_close: Joi.string(),
      friday_open: Joi.string(),
      friday_close: Joi.string(),
      saturday_open: Joi.string(),
      saturday_close: Joi.string(),
      network_name: Joi.string(),
      isp: Joi.string(),
      contracted_speed_upload: Joi.string(),
      contracted_speed_download: Joi.string(),
      ip: Joi.array().items(Joi.string().ip()),
      bandwidth_cap_upload: Joi.string(),
      bandwidth_cap_download: Joi.string(),
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
