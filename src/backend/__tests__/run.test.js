import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validRun = {
  SchemaVersion: 1,
  TestName: 'ndt7',
  TestStartTime: '2020-09-21T20:32:52.639Z',
  TestEndTime: '2020-09-21T20:33:02.640Z',
  TestUUID: '379a7e99-f061-4f4b-bf0a-3b89dec3b291',
  TestProtocol: 'ndt7',
  TestError: '',
  ServerName: 'example.com',
  ServerIP: '0.0.0.0',
  ClientIP: '192.168.0.1',
  MurakamiLocation: 'Corciano',
  MurakamiNetworkType: 'home',
  MurakamiConnectionType: 'wifi',
  MurakamiDeviceID: 'b6ae86d2-3f59-43e0-83f1-600901cd6b71',
  DownloadUUID: 'ndt-cz99j_1580820576_000000000003708B',
  DownloadTestStartTime: '2020-09-21T20:32:52.639Z',
  DownloadTestEndTime: '2020-09-21T20:33:02.640Z',
  DownloadValue: 123.45678901234567,
  DownloadUnit: 'Mbit/s',
  DownloadError: '',
  DownloadRetransValue: 123.45678901234567,
  DownloadRetransUnit: '%',
  UploadValue: 123.45678901234567,
  UploadUnit: 'Mbit/s',
  MinRTTValue: 12.345,
  MinRTTUnit: 'ms',
};

const invalidRun = {
  SchemaVersion: null,
  TestName: 0,
  TestStartTime: 0,
  TestEndTime: 0,
  TestUUID: 'invaliduuid',
  TestProtocol: null,
  TestError: 0,
  ServerName: 0,
  ServerIP: '256.256.256.256',
  ClientIP: '256.256.256.256',
  MurakamiLocation: 0,
  MurakamiNetworkType: 0,
  MurakamiConnectionType: 0,
  MurakamiRunID: 0,
  DownloadUUID: 0,
  DownloadTestStartTime: 0,
  DownloadTestEndTime: 0,
  DownloadValue: null,
  DownloadUnit: 0,
  DownloadError: 0,
  DownloadRetransValue: null,
  DownloadRetransUnit: 0,
  UploadValue: null,
  UploadUnit: 0,
  MinRTTValue: null,
  MinRTTUnit: 0,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search runs as an admin', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: 'admin', password: 'averylongandgoodpassword' })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Search sorted runs', async () => {
    const ascending = await session.get('/api/v1/runs').expect(200);
    const descending = await session.get('/api/v1/runs?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit runs', async () => {
    const first_two = await session
      .get('/api/v1/runs?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/runs?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/runs').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });

  test('Filter by library', async () => {
    const library_one = await session.get('/api/v1/runs?library=1').expect(200);
    const library_two = await session.get('/api/v1/runs?library=2').expect(200);
    const all = await session.get('/api/v1/runs').expect(200);
    expect(all.body.data.length).toEqual(
      library_one.body.data.length + library_two.body.data.length,
    );
  });
});

describe('Manage runs as an admin', () => {
  const validRunResponse = {
    statusCode: 201,
    status: 'created',
    data: expect.anything(),
  };

  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: 'admin', password: 'averylongandgoodpassword' })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Create run successfully', async () => {
    const res = await session
      .post('/api/v1/runs')
      .send({ data: [validRun] })
      .expect(201);
    expect(res.body).toMatchObject(validRunResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const run = await session
      .get(`/api/v1/runs/${res.body.data[0].id}`)
      .expect(200);
    expect(run.body.data[0]).toMatchObject(validRun);
  });

  each(
    Object.entries(invalidRun).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to create run with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/runs')
      .send({ data: [{ ...validRun, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty run', async () => {
    await session
      .post('/api/v1/runs')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validRun).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a run with attribute %p', async attribute => {
    await session
      .put('/api/v1/runs/1')
      .send({ data: { ...validRun, ...attribute } })
      .expect(204);
  });

  each(
    Object.entries(invalidRun).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to edit a run with invalid attribute %p', async attribute => {
    await session
      .put('/api/v1/runs/1')
      .send({ data: { ...validRun, ...attribute } })
      .expect(400);
  });

  test('Attempt to update a run that does not exist', async () => {
    await session
      .put('/api/v1/runs/99')
      .send({ data: validRun })
      .expect(201);
  });

  test('Delete a run', async () => {
    await session.delete('/api/v1/runs/1').expect(204);
  });

  test('Attempt to delete a nonexistent run', async () => {
    await session.delete('/api/v1/runs/100').expect(404);
  });

  test('Verify run does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/runs/4').expect(404);
  });
});

describe('Access runs as an editor', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: 'editor', password: 'averylongandgoodpassword' })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Create run successfully', async () => {
    await session
      .post('/api/v1/runs')
      .send({ data: [validRun] })
      .expect(201);
  });

  test('Attempt to create an empty run', async () => {
    await session
      .post('/api/v1/runs')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validRun).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a run with attribute %p', async attribute => {
    await session
      .put('/api/v1/runs/1')
      .send({ data: { ...validRun, ...attribute } })
      .expect(403);
  });

  test('Attempt to update a run that does not exist', async () => {
    await session
      .put('/api/v1/runs/99')
      .send({ data: validRun })
      .expect(403);
  });

  test('Delete a run', async () => {
    await session
      .delete('/api/v1/runs/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent run', async () => {
    await session
      .delete('/api/v1/runs/100')
      .send({})
      .expect(403);
  });

  test('Verify run does not belong to library', async () => {
    await session.get('/api/v1/libraries/2/runs/1').expect(404);
  });

  test('Verify run does belong to library', async () => {
    await session.get('/api/v1/libraries/2/runs/3').expect(200);
  });

  test('Attempt to access runs in different library', async () => {
    await session.get('/api/v1/libraries/1/runs').expect(403);
  });

  test('Attempt to access a run in different library', async () => {
    await session.get('/api/v1/libraries/1/runs/1').expect(403);
  });
});

describe('Access runs as a viewer', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: 'viewer', password: 'averylongandgoodpassword' })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Create a run successfully', async () => {
    await session
      .post('/api/v1/runs')
      .send({ data: [validRun] })
      .expect(201);
  });

  test('Attempt to create an empty run', async () => {
    await session
      .post('/api/v1/runs')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validRun).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a run with attribute %p', async attribute => {
    await session
      .put('/api/v1/runs/1')
      .send({ data: { ...validRun, ...attribute } })
      .expect(403);
  });

  test('Attempt to update a run that does not exist', async () => {
    await session
      .put('/api/v1/runs/99')
      .send({ data: validRun })
      .expect(403);
  });

  test('Delete a run', async () => {
    await session
      .delete('/api/v1/runs/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent run', async () => {
    await session
      .delete('/api/v1/runs/100')
      .send({})
      .expect(403);
  });

  test('Verify run does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/runs/4').expect(404);
  });

  test('Verify run does belong to library', async () => {
    await session.get('/api/v1/libraries/1/runs/1').expect(200);
  });

  test('Attempt to access runs in different library', async () => {
    await session.get('/api/v1/libraries/2/runs').expect(403);
  });

  test('Attempt to access a run in different library', async () => {
    await session.get('/api/v1/libraries/2/runs/3').expect(403);
  });
});
