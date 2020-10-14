import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validNetwork = {
  name: 'TestNetwork',
  isp: 'Not Evil At All Company',
  ips: '173.79.94.143, 54.243.1.20',
  contracted_speed_upload: '900 mbps',
  contracted_speed_download: '989 mbps',
  bandwidth_cap_upload: '50 mb',
  bandwidth_cap_download: '900 mb',
};

const invalidNetwork = {
  name: undefined,
  isp: 9,
  ips: '256.256.256.256',
  contracted_speed_upload: 0,
  contracted_speed_download: 7,
  bandwidth_cap_upload: [],
  bandwidth_cap_download: [],
};

afterAll(async () => {
  return db.destroy();
});

describe('Search networks as an admin', () => {
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

  test('Search sorted networks', async () => {
    const ascending = await session.get('/api/v1/networks').expect(200);
    const descending = await session
      .get('/api/v1/networks?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit networks', async () => {
    const first_two = await session
      .get('/api/v1/networks?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/networks?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/networks').expect(200);
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
      .get('/api/v1/networks?library=1')
      .expect(200);
    const library_two = await session
      .get('/api/v1/networks?library=2')
      .expect(200);
    const all = await session.get('/api/v1/networks').expect(200);
    expect(all.body.data.length).toEqual(
      library_one.body.data.length + library_two.body.data.length,
    );
  });
});

describe('Manage networks as an admin', () => {
  const validNetworkResponse = {
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

  test('Create network successfully', async () => {
    const res = await session
      .post('/api/v1/networks')
      .send({ data: [validNetwork] })
      .expect(201);
    expect(res.body).toMatchObject(validNetworkResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const network = await session
      .get(`/api/v1/networks/${res.body.data[0].id}`)
      .expect(200);
    expect(network.body.data[0]).toMatchObject(validNetwork);
  });

  each(
    Object.entries(invalidNetwork).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to create network with invalid attribute %p',
    async invalid => {
      await session
        .post('/api/v1/networks')
        .send({ data: [{ ...validNetwork, ...invalid }] })
        .expect(400);
    },
  );

  test('Attempt to create an empty network', async () => {
    await session
      .post('/api/v1/networks')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validNetwork).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a network with attribute %p', async attribute => {
    await session
      .put('/api/v1/networks/1')
      .send({ data: { ...validNetwork, ...attribute } })
      .expect(204);
  });

  each(
    Object.entries(invalidNetwork).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a network with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/networks/1')
        .send({ data: { ...validNetwork, ...attribute } })
        .expect(400);
    },
  );

  test('Attempt to update a network that does not exist', async () => {
    await session
      .put('/api/v1/networks/99')
      .send({ data: validNetwork })
      .expect(201);
  });

  test('Delete a network', async () => {
    await session.delete('/api/v1/networks/1').expect(204);
  });

  test('Attempt to delete a nonexistent network', async () => {
    await session.delete('/api/v1/networks/100').expect(404);
  });

  test('Verify network does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/networks/4').expect(404);
  });

  test('Add network to library', async () => {
    await session.put('/api/v1/libraries/2/networks/2').expect(204);
    await session.get('/api/v1/libraries/2/networks/2').expect(200);
  });

  test('Remove network from library', async () => {
    await session.delete('/api/v1/libraries/2/networks/4').expect(204);
    await session.get('/api/v1/libraries/2/networks/4').expect(404);
  });
});

describe('Access networks as an editor', () => {
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

  test('Attempt to create a network unsuccessfully', async () => {
    await session
      .post('/api/v1/networks')
      .send({ data: [validNetwork] })
      .expect(403);
  });

  test('Attempt to create an empty network', async () => {
    await session
      .post('/api/v1/libraries/2/networks')
      .send({ data: [] })
      .expect(403);
  });

  test('Attempt to update a network that does not exist', async () => {
    await session
      .put('/api/v1/networks/99')
      .send({ data: validNetwork })
      .expect(403);
  });

  test('Delete a network', async () => {
    await session
      .delete('/api/v1/networks/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent network', async () => {
    await session
      .delete('/api/v1/networks/100')
      .send({})
      .expect(403);
  });

  test('Verify network does not belong to library', async () => {
    await session.get('/api/v1/libraries/2/networks/1').expect(404);
  });

  test('Verify network does belong to library', async () => {
    await session.get('/api/v1/libraries/2/networks/3').expect(200);
  });

  test('Attempt to access networks in different library', async () => {
    await session.get('/api/v1/libraries/1/networks').expect(403);
  });

  test('Attempt to access a network in different library', async () => {
    await session.get('/api/v1/libraries/1/networks/1').expect(403);
  });

  test('Attempt to add network to library', async () => {
    await session.put('/api/v1/libraries/2/networks/2').expect(403);
  });

  test('Attempt to remove network from library', async () => {
    await session.delete('/api/v1/libraries/2/networks/3').expect(403);
  });
});

describe('Access networks as a viewer', () => {
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

  test('Attempt to create a network unsuccessfully', async () => {
    await session
      .post('/api/v1/networks')
      .send({ data: [validNetwork] })
      .expect(403);
  });

  test('Attempt to create an empty network', async () => {
    await session
      .post('/api/v1/networks')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validNetwork).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a network with attribute %p', async attribute => {
    await session
      .put('/api/v1/networks/1')
      .send({ data: { ...validNetwork, ...attribute } })
      .expect(403);
  });

  test('Attempt to update a network that does not exist', async () => {
    await session
      .put('/api/v1/networks/99')
      .send({ data: validNetwork })
      .expect(403);
  });

  test('Delete a network', async () => {
    await session
      .delete('/api/v1/networks/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent network', async () => {
    await session
      .delete('/api/v1/networks/100')
      .send({})
      .expect(403);
  });

  test('Verify network does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/networks/4').expect(404);
  });

  test('Verify network does belong to library', async () => {
    await session.get('/api/v1/libraries/1/networks/1').expect(200);
  });

  test('Attempt to access networks in different library', async () => {
    await session.get('/api/v1/libraries/2/networks').expect(403);
  });

  test('Attempt to access a network in different library', async () => {
    await session.get('/api/v1/libraries/2/networks/3').expect(403);
  });

  test('Attempt to add network to library', async () => {
    await session.put('/api/v1/libraries/2/networks/2').expect(403);
  });

  test('Attempt to remove network from library', async () => {
    await session.delete('/api/v1/libraries/2/networks/4').expect(403);
  });
});
