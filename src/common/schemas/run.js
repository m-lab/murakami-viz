import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

// TODO: includes ndt5 & ndt7 fields, add from DASH & speedtest-cli after feedback
const schema = Joi.object({
  SchemaVersion: Joi.number(),
  TestName: Joi.string(),
  TestUUID: Joi.string().guid(),
  TestProtocol: Joi.string(),
  TestError: Joi.string(),
  ServerName: Joi.string().domain(),
  ServerIP: Joi.string().ip(),
  ClientIP: Joi.string().ip(),
  MurakamiLocation: Joi.string(),
  MurakamiNetworkType: Joi.string(),
  MurakamiConnectionType: Joi.string(),
  DownloadUUID: Joi.string().guid(),
  DownloadTestStartTime: Joi.string().isoDate(),
  DownloadTestEndTime: Joi.string().isoDate(),
  DownloadValue: Joi.number(),
  DownloadUnit: Joi.string(),
  DownloadError: Joi.string(),
  DownloadRetransValue: Joi.number(),
  DownloadRetransUnit: Joi.string(),
  UploadValue: Joi.number(),
  UploadUnit: Joi.string(),
  UploadError: Joi.string(),
  MinRTTValue: Joi.number(),
  MinRTTUnit: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
