import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

// TODO: includes ndt5 & ndt7 fields, add from DASH & speedtest-cli after feedback
const creationSchema = Joi.array()
  .items(
    Joi.object({
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
      TestError: Joi.string().allow(''),
      ServerName: Joi.string(),
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
      DownloadUUID: Joi.string(),
      DownloadTestStartTime: Joi.string().isoDate(),
      DownloadTestEndTime: Joi.string().isoDate(),
      DownloadValue: Joi.number().required(),
      DownloadUnit: Joi.string(),
      DownloadError: Joi.string().allow(''),
      DownloadRetransValue: Joi.number(),
      DownloadRetransUnit: Joi.string(),
      Isp: Joi.string(),
      IspDownloadAvg: Joi.number(),
      IspUploadAvg: Joi.number(),
      IspRating: Joi.number(),
      Rating: Joi.number(),
      UploadValue: Joi.number().required(),
      UploadUnit: Joi.string(),
      UploadError: Joi.string().allow(''),
      MinRTTValue: Joi.number(),
      MinRTTUnit: Joi.string(),
      MinRTTError: Joi.string().allow(''),
      MedianBitrate: Joi.number(),
      MedianBitrateUnits: Joi.string(),
      MinPlayoutDelay: Joi.number(),
      MinPlayoutDelayUnits: Joi.string(),
      Ping: Joi.number(),
      PingUnit: Joi.string(),
      BytesSent: Joi.number(),
      BytesReceived: Joi.number(),
      Timestamp: Joi.string().isoDate(),
      Share: Joi.string(),
      ProbeASN: Joi.string(),
      ProbeCC: Joi.string(),
      ConnectLatency: Joi.number(),
      ConnectLatencyUnits: Joi.string(),
      LoggedIn: Joi.number(),
      Country: Joi.string(),
    }),
  )
  .sparse()
  .min(1);

const updateSchema = Joi.array()
  .items(
    Joi.object({
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
      TestError: Joi.string().allow(''),
      ServerName: Joi.string(),
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
      DownloadUUID: Joi.string(),
      DownloadTestStartTime: Joi.string().isoDate(),
      DownloadTestEndTime: Joi.string().isoDate(),
      DownloadValue: Joi.number().required(),
      DownloadUnit: Joi.string(),
      DownloadError: Joi.string().allow(''),
      DownloadRetransValue: Joi.number(),
      DownloadRetransUnit: Joi.string(),
      Isp: Joi.string(),
      IspDownloadAvg: Joi.number(),
      IspUploadAvg: Joi.number(),
      IspRating: Joi.number(),
      Rating: Joi.number(),
      UploadValue: Joi.number().required(),
      UploadUnit: Joi.string(),
      UploadError: Joi.string().allow(''),
      MinRTTValue: Joi.number(),
      MinRTTUnit: Joi.string(),
      MinRTTError: Joi.string().allow(''),
      MedianBitrate: Joi.number(),
      MedianBitrateUnits: Joi.string(),
      MinPlayoutDelay: Joi.number(),
      MinPlayoutDelayUnits: Joi.string(),
      Ping: Joi.number(),
      PingUnit: Joi.string(),
      BytesSent: Joi.number(),
      BytesReceived: Joi.number(),
      Timestamp: Joi.string().isoDate(),
      Share: Joi.string(),
      ProbeASN: Joi.string(),
      ProbeCC: Joi.string(),
      ConnectLatency: Joi.number(),
      ConnectLatencyUnits: Joi.string(),
      LoggedIn: Joi.number(),
      Country: Joi.string(),
    }),
  )
  .sparse()
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
