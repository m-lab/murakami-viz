import Session from 'supertest-session';
import each from 'jest-each';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const deviceId = uuidv4();
const validDevice = {
  name: 'TestDevice',
  network_type: 'egress',
  connection_type: 'wifi',
  dns_server: '8.8.8.8',
  gateway: '192.168.1.1',
  ip: '192.168.1.100',
  mac: 'AB:CD:EF:01:23:45',
  deviceid: deviceId,
};

const invalidIp = '256.256.256.256';
const invalidMac = 'GH:IJ:KL:MN:OP:QR';

const invalidDevice = {
  name: undefined,
  network_type: 0,
  connection_type: 0,
  dns_server: invalidIp,
  gateway: invalidIp,
  ip: invalidIp,
  mac: invalidMac,
  deviceid: undefined,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search devices as an admin', () => {
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

  test('Search sorted devices', async () => {
    const ascending = await session.get('/api/v1/devices').expect(200);
    const descending = await session
      .get('/api/v1/devices?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit devices', async () => {
    const first_two = await session
      .get('/api/v1/devices?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/devices?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/devices').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });

  test('Filter by library', async () => {
    const library_one = await session
      .get('/api/v1/devices?library=1')
      .expect(200);
    const library_two = await session
      .get('/api/v1/devices?library=2')
      .expect(200);
    const all = await session.get('/api/v1/devices').expect(200);
    expect(all.body.data.length).toEqual(
      library_one.body.data.length + library_two.body.data.length,
    );
  });
});

describe('Manage devices as an admin', () => {
  const validDeviceResponse = {
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

  test('Create device successfully', async () => {
    const res = await session
      .post('/api/v1/devices')
      .send({ data: [validDevice] })
      .expect(201);
    expect(res.body).toMatchObject(validDeviceResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const device = await session
      .get(`/api/v1/devices/${res.body.data[0].id}`)
      .expect(200);
    expect(device.body.data[0]).toMatchObject(validDevice);
  });

  each(
    Object.entries(invalidDevice).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to create device with invalid attribute %p',
    async invalid => {
      await session
        .post('/api/v1/devices')
        .send({ data: [{ ...validDevice, ...invalid }] })
        .expect(400);
    },
  );

  test('Attempt to create an empty device', async () => {
    await session
      .post('/api/v1/devices')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries({ ...validDevice, deviceid: uuidv4() }).map(
      ([key, value]) => [{ [`${key}`]: value }],
    ),
  ).test('Edit a device with attribute %p', async attribute => {
    await session
      .put('/api/v1/devices/1')
      .send({ data: attribute })
      .expect(204);
  });

  each(
    Object.entries(invalidDevice).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a device with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/devices/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a device that does not exist', async () => {
    await session
      .put('/api/v1/devices/99')
      .send({ data: validDevice })
      .expect(400);
  });

  test('Delete a device', async () => {
    await session.delete('/api/v1/devices/1').expect(204);
  });

  test('Attempt to delete a nonexistent device', async () => {
    await session.delete('/api/v1/devices/100').expect(404);
  });

  test('Verify device does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/devices/4').expect(404);
  });

  test('Add device to library', async () => {
    await session.put('/api/v1/libraries/2/devices/2').expect(204);
    await session.get('/api/v1/libraries/2/devices/2').expect(200);
  });

  test('Remove device from library', async () => {
    await session.delete('/api/v1/libraries/2/devices/4').expect(204);
    await session.get('/api/v1/libraries/2/devices/4').expect(404);
  });
});

describe('Access devices as an editor', () => {
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

  test('Attempt to create a device unsuccessfully', async () => {
    await session
      .post('/api/v1/devices')
      .send({ data: [validDevice] })
      .expect(403);
  });

  test('Attempt to create an empty device', async () => {
    await session
      .post('/api/v1/devices')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries({ ...validDevice, deviceid: uuidv4() }).map(
      ([key, value]) => [{ [`${key}`]: value }],
    ),
  ).test('Edit a device with attribute %p', async attribute => {
    await session
      .put('/api/v1/devices/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a device that does not exist', async () => {
    await session
      .put('/api/v1/devices/99')
      .send({ data: validDevice })
      .expect(403);
  });

  test('Delete a device', async () => {
    await session
      .delete('/api/v1/devices/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent device', async () => {
    await session
      .delete('/api/v1/devices/100')
      .send({})
      .expect(403);
  });

  test('Verify device does not belong to library', async () => {
    await session.get('/api/v1/libraries/2/devices/1').expect(404);
  });

  test('Verify device does belong to library', async () => {
    await session.get('/api/v1/libraries/2/devices/3').expect(200);
  });

  test('Attempt to access devices in different library', async () => {
    await session.get('/api/v1/libraries/1/devices').expect(403);
  });

  test('Attempt to access a device in different library', async () => {
    await session.get('/api/v1/libraries/1/devices/1').expect(403);
  });

  test('Attempt to add device to library', async () => {
    await session.put('/api/v1/libraries/2/devices/2').expect(403);
  });

  test('Attempt to remove device from library', async () => {
    await session.delete('/api/v1/libraries/2/devices/4').expect(403);
  });
});

describe('Access devices as a viewer', () => {
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

  test('Attempt to create a device unsuccessfully', async () => {
    await session
      .post('/api/v1/devices')
      .send({ data: [validDevice] })
      .expect(403);
  });

  test('Attempt to create an empty device', async () => {
    await session
      .post('/api/v1/devices')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries({ ...validDevice, deviceid: uuidv4() }).map(
      ([key, value]) => [{ [`${key}`]: value }],
    ),
  ).test('Edit a device with attribute %p', async attribute => {
    await session
      .put('/api/v1/devices/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a device that does not exist', async () => {
    await session
      .put('/api/v1/devices/99')
      .send({ data: validDevice })
      .expect(403);
  });

  test('Delete a device', async () => {
    await session
      .delete('/api/v1/devices/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent device', async () => {
    await session
      .delete('/api/v1/devices/100')
      .send({})
      .expect(403);
  });

  test('Verify device does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/devices/4').expect(404);
  });

  test('Verify device does belong to library', async () => {
    await session.get('/api/v1/libraries/1/devices/1').expect(200);
  });

  test('Attempt to access devices in different library', async () => {
    await session.get('/api/v1/libraries/2/devices').expect(403);
  });

  test('Attempt to access a device in different library', async () => {
    await session.get('/api/v1/libraries/2/devices/3').expect(403);
  });

  test('Attempt to add device to library', async () => {
    await session.put('/api/v1/libraries/2/devices/2').expect(403);
  });

  test('Attempt to remove device from library', async () => {
    await session.delete('/api/v1/libraries/2/devices/4').expect(403);
  });
});
