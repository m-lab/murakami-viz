import Session from 'supertest-session';
import each from 'jest-each';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const salt = bcrypt.genSaltSync();
const hash = bcrypt.hashSync('averylongandgoodpassword', salt);

const validUser = {
  username: 'storm',
  password: hash,
  firstName: 'Ororo',
  lastName: 'Munroe',
  email: 'storm@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 555,
};

const validUser2 = {
  username: 'magneto',
  password: hash,
  firstName: 'Erik',
  lastName: 'Lehnsherr',
  email: 'magneto@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 556,
};

const validUser3 = {
  username: 'profx',
  password: hash,
  firstName: 'Charles',
  lastName: 'Xavier',
  email: 'profx@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 557,
};

const validUser4 = {
  username: 'wq',
  password: hash,
  firstName: 'Emma',
  lastName: 'Frost',
  email: 'wq@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 558,
};

const validUser5 = {
  username: 'apocalypse',
  password: hash,
  firstName: 'En',
  lastName: 'Sabah Nur',
  email: 'apocalypse@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 559,
};

const validUser6 = {
  username: 'nightcrawler',
  password: hash,
  firstName: 'Kurt',
  lastName: 'Wagner',
  email: 'nightcrawler@qc.krakoa',
  phone: '1-555-867-5309',
  extension: 550,
};

const invalidUser = {
  username: 0,
  password: 0,
  firstName: 0,
  lastName: 0,
  email: 0,
  phone: 0,
  extension: null,
  isActive: 0,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search users as an admin', () => {
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

  test('Search sorted users', async () => {
    const ascending = await session.get('/api/v1/users').expect(200);
    const descending = await session.get('/api/v1/users?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit users', async () => {
    const first_two = await session
      .get('/api/v1/users?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/users?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/users').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Manage users as an admin', () => {
  const validUserResponse = {
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

  test('Create user successfully', async () => {
    const res = await session
      .post('/api/v1/users')
      .send({ data: [validUser] })
      .expect(201);
    expect(res.body).toMatchObject(validUserResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const user = await session
      .get(`/api/v1/users/${res.body.data[0].id}`)
      .expect(200);
    delete validUser.password;
    expect(user.body.data[0]).toMatchObject(validUser);
  });

  each(
    Object.entries(invalidUser).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to create user with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/users')
      .send({ data: [{ ...validUser2, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty user', async () => {
    await session
      .post('/api/v1/users')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validUser3).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a user with attribute %p', async attribute => {
    await session
      .put('/api/v1/users/2')
      .send({ data: [{ ...validUser4, ...attribute }] })
      .expect(204);
  });

  each(
    Object.entries(invalidUser).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test(
    'Attempt to edit a user with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/users/1')
        .send({ data: [{ ...validUser5, ...attribute }] })
        .expect(400);
    },
  );

  test('Attempt to update a user that does not exist', async () => {
    await session
      .put('/api/v1/users/99')
      .send({ data: validUser6 })
      .expect(201);
  });

  test('Delete a user', async () => {
    await session.delete('/api/v1/users/3').expect(204);
  });

  test('Attempt to delete a nonexistent user', async () => {
    await session.delete('/api/v1/users/100').expect(404);
  });
});

describe('Access users as an editor', () => {
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

  test('Attempt to create a user unsuccessfully', async () => {
    await session
      .post('/api/v1/users')
      .send({ data: [validUser] })
      .expect(403);
  });

  test('Attempt to create an empty user', async () => {
    await session
      .post('/api/v1/users')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validUser2).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a user with attribute %p', async attribute => {
    await session
      .put('/api/v1/users/2')
      .send({ data: [{ ...validUser3, ...attribute }] })
      .expect(403);
  });

  test('Attempt to update a user that does not exist', async () => {
    await session
      .put('/api/v1/users/99')
      .send({ data: validUser4 })
      .expect(403);
  });

  test('Delete a user', async () => {
    await session
      .delete('/api/v1/users/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent user', async () => {
    await session
      .delete('/api/v1/users/100')
      .send({})
      .expect(403);
  });
});

describe('Access users as a viewer', () => {
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

  test('Attempt to create a user unsuccessfully', async () => {
    await session
      .post('/api/v1/users')
      .send({ data: [validUser] })
      .expect(403);
  });

  test('Attempt to create an empty user', async () => {
    await session
      .post('/api/v1/users')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validUser2).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a user with attribute %p', async attribute => {
    await session
      .put('/api/v1/users/2')
      .send({ data: [{ ...validUser3, ...attribute }] })
      .expect(403);
  });

  test('Attempt to update a user that does not exist', async () => {
    await session
      .put('/api/v1/users/99')
      .send({ data: validUser4 })
      .expect(403);
  });

  test('Delete a user', async () => {
    await session
      .delete('/api/v1/users/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent user', async () => {
    await session
      .delete('/api/v1/users/100')
      .send({})
      .expect(403);
  });
});
