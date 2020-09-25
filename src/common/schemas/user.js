import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const creationSchema = Joi.array()
  .items(
    Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      location: Joi.number(),
      email: Joi.string().required(),
      phone: Joi.string(),
      extension: Joi.number(),
      role: Joi.number(),
    }),
  )
  .min(1);

const updateSchema = Joi.array()
  .items(
    Joi.object({
      username: Joi.string().required(),
      password: Joi.string(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      location: Joi.number(),
      email: Joi.string().required(),
      phone: Joi.string(),
      extension: Joi.number(),
      role: Joi.number(),
    }),
  )
  .min(1);

// schema for users editing their own account
const updateSelfSchema = Joi.array()
  .items(
    Joi.object({
      username: Joi.string().required(),
      oldPassword: Joi.string().allow(''),
      newPassword: Joi.string().allow(''),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      location: Joi.number(),
      email: Joi.string().required(),
      phone: Joi.string(),
      extension: Joi.number(),
      role: Joi.number(),
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

export async function validateUpdateSelf(data) {
  try {
    data = Array.isArray(data) ? data : [data];
    const value = await updateSelfSchema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate JSON: ', err);
  }
}
