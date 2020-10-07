import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validNetwork = {
  name: 'TestNetwork',
  isp: 'Not Evil At All Company',
  ips: ['173.79.94.143', '54.243.1.20'],
  contracted_speed_upload: '900 mbps',
  contracted_speed_download: '989 mbps',
  bandwidth_cap_upload: '50 mb',
  bandwidth_cap_download: '900 mb'
};

const invalidNetwork = {
  name: undefined,
  isp: 9,
  ips: '256.256.256.256',
  contracted_speed_upload: 0,
  contracted_speed_download: 7,
  bandwidth_cap_upload: [],
  bandwidth_cap_download: undefined
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



