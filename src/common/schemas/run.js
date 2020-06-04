import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

// TODO: includes ndt5 & ndt7 fields, add from DASH & speedtest-cli after feedback
const schema = Joi.object({
  TestName: Joi.string().required(),
  TestStartTime: Joi.string()
    .isoDate()
    .required(),
  TestEndTime: Joi.string()
    .isoDate()
    .required(),
  MurakamiConnectionType: Joi.string().required(),
  MurakamiDeviceID: Joi.string().required(),
  MurakamiLocation: Joi.string().required(),
  MurakamiNetworkType: Joi.string().required(),
  SchemaVersion: Joi.number(),
  TestUUID: Joi.string().guid(),
  TestProtocol: Joi.string(),
  TestError: Joi.string(),
  ServerName: Joi.string().domain(),
  ServerIP: Joi.string().ip(),
  ServerURL: Joi.string().uri(),
  ServerLat: Joi.number(),
  ServerLon: Joi.number(),
  ServerCountry: Joi.string(),
  ServerCountryCode: Joi.string(),
  ServerSponsor: Joi.string(),
  ServerID: Joi.number(),
  ServerHost: Joi.string(),
  ServerDistance: Joi.number(),
  ServerLatency: Joi.number(),
  ServerLatencyUnits: Joi.string(),
  ClientIP: Joi.string().ip(),
  ClientLat: Joi.number(),
  ClientLon: Joi.number(),
  DownloadUUID: Joi.string().guid(),
  DownloadTestStartTime: Joi.string().isoDate(),
  DownloadTestEndTime: Joi.string().isoDate(),
  DownloadValue: Joi.number(),
  DownloadUnit: Joi.string(),
  DownloadError: Joi.string(),
  DownloadRetransValue: Joi.number(),
  DownloadRetransUnit: Joi.string(),
  Isp: Joi.string(),
  IspDownloadAvg: Joi.number(),
  IspUploadAvg: Joi.number(),
  IspRating: Joi.number(),
  Rating: Joi.number(),
  UploadValue: Joi.number(),
  UploadUnit: Joi.string(),
  UploadError: Joi.string(),
  MinRTTValue: Joi.number(),
  MinRTTUnit: Joi.string(),
  MinRTTError: Joi.string(),
  MedianBitrate: Joi.number(),
  MedianBitrateUnits: Joi.string(),
  MinPlayoutDelay: Joi.number(),
  MinPlayoutDelayUnits: Joi.string(),
  Ping: Joi.number(),
  PingUnits: Joi.string(),
  BytesSent: Joi.number(),
  BytesReceived: Joi.number(),
  Share: Joi.string(),
  ProbeASN: Joi.string(),
  ProbeCC: Joi.string(),
  ConnectLatency: Joi.number(),
  ConnectLatencyUnits: Joi.string(),
  LoggedIn: Joi.number(),
  Country: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
