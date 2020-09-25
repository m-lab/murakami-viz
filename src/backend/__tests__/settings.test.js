import Session from 'supertest-session';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validSetting = {
  value: '42',
};

afterAll(async () => {
  return db.destroy();
});

describe('Manage settings as an admin', () => {
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

  test('Get settings', async () => {
    await session.get('/api/v1/settings').expect(200);
  });

  test('Set a new setting', async () => {
    await session
      .put('/api/v1/settings/answer')
      .send({ data: [validSetting] })
      .expect(201);
    const answer = await session.get('/api/v1/settings/answer').expect(200);
    expect(answer.body.data[0].value).toEqual(validSetting.value);
  });

  test('Update a setting', async () => {
    await session
      .put('/api/v1/settings/about')
      .send({ data: validSetting })
      .expect(204);
    const answer = await session.get('/api/v1/settings/about').expect(200);
    expect(answer.body.data[0].value).toEqual(validSetting.value);
  });

  test('Attempt to create an empty setting', async () => {
    await session
      .put('/api/v1/settings/empty')
      .send({ data: [] })
      .expect(400);
  });

  test('Delete a setting', async () => {
    await session.delete('/api/v1/settings/about').expect(204);
  });

  test('Attempt to delete a nonexistent setting', async () => {
    await session.delete('/api/v1/settings/whatever').expect(404);
  });
});

describe('Access settings as an editor', () => {
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

  test('Get settings', async () => {
    await session.get('/api/v1/settings').expect(200);
  });

  test('Set a new setting', async () => {
    await session
      .put('/api/v1/settings/answer')
      .send({ data: [validSetting] })
      .expect(403);
  });

  test('Update a setting', async () => {
    await session
      .put('/api/v1/settings/about')
      .send({ data: validSetting })
      .expect(403);
  });

  test('Attempt to create an empty setting', async () => {
    await session
      .put('/api/v1/settings/empty')
      .send({ data: [] })
      .expect(403);
  });

  test('Delete a setting', async () => {
    await session.delete('/api/v1/settings/about').expect(403);
  });

  test('Attempt to delete a nonexistent setting', async () => {
    await session.delete('/api/v1/settings/whatever').expect(403);
  });
});

describe('Access settings as a viewer', () => {
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

  test('Get settings', async () => {
    await session.get('/api/v1/settings').expect(200);
  });

  test('Set a new setting', async () => {
    await session
      .put('/api/v1/settings/answer')
      .send({ data: [validSetting] })
      .expect(403);
  });

  test('Update a setting', async () => {
    await session
      .put('/api/v1/settings/about')
      .send({ data: validSetting })
      .expect(403);
  });

  test('Attempt to create an empty setting', async () => {
    await session
      .put('/api/v1/settings/empty')
      .send({ data: [] })
      .expect(403);
  });

  test('Delete a setting', async () => {
    await session.delete('/api/v1/settings/about').expect(403);
  });

  test('Attempt to delete a nonexistent setting', async () => {
    await session.delete('/api/v1/settings/whatever').expect(403);
  });
});
