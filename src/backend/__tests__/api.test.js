import Session from 'supertest-session';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

describe('Authenticate to API', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(() => {
    session = Session(server(config));
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback().then(() => db.destroy());
  });

  test('Authenticate unsuccessfully', async () => {
    await session
      .post('/api/v1/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .expect(401);
  });

  test('Authenticate successfully', async () => {
    await session
      .post('/api/v1/login')
      .send({ username: 'admin', password: 'averylongandgoodpassword' })
      .expect(200);
  });
});
