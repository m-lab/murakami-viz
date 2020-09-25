import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validFaq = {
  question: 'What is the meaning of life, the universe, and everything?',
  answer: '42',
};

const invalidFaq = {
  question: 0,
  answer: 0,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search faqs as an admin', () => {
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

  test('Search sorted faqs', async () => {
    const ascending = await session.get('/api/v1/faqs').expect(200);
    const descending = await session.get('/api/v1/faqs?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit faqs', async () => {
    const first_two = await session
      .get('/api/v1/faqs?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/faqs?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/faqs').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Manage faqs as an admin', () => {
  const validFaqResponse = {
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

  test('Create faq successfully', async () => {
    const res = await session
      .post('/api/v1/faqs')
      .send({ data: [validFaq] })
      .expect(201);
    expect(res.body).toMatchObject(validFaqResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const faq = await session
      .get(`/api/v1/faqs/${res.body.data[0].id}`)
      .expect(200);
    expect(faq.body.data[0]).toMatchObject(validFaq);
  });

  each(
    Object.entries(invalidFaq).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to create faq with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [{ ...validFaq, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty faq', async () => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validFaq).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a faq with attribute %p', async attribute => {
    await session
      .put('/api/v1/faqs/1')
      .send({ data: attribute })
      .expect(204);
  });

  each(
    Object.entries(invalidFaq).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to edit a faq with invalid attribute %p', async attribute => {
    await session
      .put('/api/v1/faqs/1')
      .send({ data: attribute })
      .expect(400);
  });

  test('Attempt to update a faq that does not exist', async () => {
    await session
      .put('/api/v1/faqs/99')
      .send({ data: validFaq })
      .expect(201);
  });

  test('Delete a faq', async () => {
    await session.delete('/api/v1/faqs/1').expect(204);
  });

  test('Attempt to delete a nonexistent faq', async () => {
    await session.delete('/api/v1/faqs/100').expect(404);
  });
});

describe('Access faqs as an editor', () => {
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

  test('Attempt to create a faq unsuccessfully', async () => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [validFaq] })
      .expect(403);
  });

  test('Attempt to create an empty faq', async () => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validFaq).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a faq with attribute %p', async attribute => {
    await session
      .put('/api/v1/faqs/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a faq that does not exist', async () => {
    await session
      .put('/api/v1/faqs/99')
      .send({ data: validFaq })
      .expect(403);
  });

  test('Delete a faq', async () => {
    await session
      .delete('/api/v1/faqs/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent faq', async () => {
    await session
      .delete('/api/v1/faqs/100')
      .send({})
      .expect(403);
  });
});

describe('Access faqs as a viewer', () => {
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

  test('Attempt to create a faq unsuccessfully', async () => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [validFaq] })
      .expect(403);
  });

  test('Attempt to create an empty faq', async () => {
    await session
      .post('/api/v1/faqs')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validFaq).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a faq with attribute %p', async attribute => {
    await session
      .put('/api/v1/faqs/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a faq that does not exist', async () => {
    await session
      .put('/api/v1/faqs/99')
      .send({ data: validFaq })
      .expect(403);
  });

  test('Delete a faq', async () => {
    await session
      .delete('/api/v1/faqs/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent faq', async () => {
    await session
      .delete('/api/v1/faqs/100')
      .send({})
      .expect(403);
  });
});
