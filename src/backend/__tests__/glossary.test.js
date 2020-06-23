import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validGlossary = {
  term: '42',
  definition: 'The meaning of life, the universe, and everything.',
};

const invalidGlossary = {
  question: 0,
  answer: 0,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search glossaries as an admin', () => {
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

  test('Search sorted glossaries', async () => {
    const ascending = await session.get('/api/v1/glossaries').expect(200);
    const descending = await session
      .get('/api/v1/glossaries?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit glossaries', async () => {
    const first_two = await session
      .get('/api/v1/glossaries?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/glossaries?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/glossaries').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Manage glossaries as an admin', () => {
  const validGlossaryResponse = {
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

  test('Create glossary successfully', async () => {
    const res = await session
      .post('/api/v1/glossaries')
      .send({ data: [validGlossary] })
      .expect(201);
    expect(res.body).toMatchObject(validGlossaryResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const glossary = await session
      .get(`/api/v1/glossaries/${res.body.data[0].id}`)
      .expect(200);
    expect(glossary.body.data[0]).toMatchObject(validGlossary);
  });

  each(
    Object.entries(invalidGlossary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to create glossary with invalid attribute %p',
    async invalid => {
      await session
        .post('/api/v1/glossaries')
        .send({ data: [{ ...validGlossary, ...invalid }] })
        .expect(400);
    },
  );

  test('Attempt to create an empty glossary', async () => {
    await session
      .post('/api/v1/glossaries')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validGlossary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a glossary with attribute %p', async attribute => {
    await session
      .put('/api/v1/glossaries/1')
      .send({ data: attribute })
      .expect(204);
  });

  each(
    Object.entries(invalidGlossary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a glossary with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/glossaries/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a glossary that does not exist', async () => {
    await session
      .put('/api/v1/glossaries/99')
      .send({ data: validGlossary })
      .expect(201);
  });

  test('Delete a glossary', async () => {
    await session.delete('/api/v1/glossaries/1').expect(204);
  });

  test('Attempt to delete a nonexistent glossary', async () => {
    await session.delete('/api/v1/glossaries/100').expect(404);
  });
});

describe('Access glossaries as an editor', () => {
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

  test('Attempt to create a glossary unsuccessfully', async () => {
    await session
      .post('/api/v1/glossaries')
      .send({ data: [validGlossary] })
      .expect(403);
  });

  test('Attempt to create an empty glossary', async () => {
    await session
      .post('/api/v1/glossaries')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validGlossary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a glossary with attribute %p', async attribute => {
    await session
      .put('/api/v1/glossaries/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a glossary that does not exist', async () => {
    await session
      .put('/api/v1/glossaries/99')
      .send({ data: validGlossary })
      .expect(403);
  });

  test('Delete a glossary', async () => {
    await session
      .delete('/api/v1/glossaries/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent glossary', async () => {
    await session
      .delete('/api/v1/glossaries/100')
      .send({})
      .expect(403);
  });
});

describe('Access glossaries as a viewer', () => {
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

  test('Attempt to create a glossary unsuccessfully', async () => {
    await session
      .post('/api/v1/glossaries')
      .send({ data: [validGlossary] })
      .expect(403);
  });

  test('Attempt to create an empty glossary', async () => {
    await session
      .post('/api/v1/glossaries')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validGlossary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a glossary with attribute %p', async attribute => {
    await session
      .put('/api/v1/glossaries/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a glossary that does not exist', async () => {
    await session
      .put('/api/v1/glossaries/99')
      .send({ data: validGlossary })
      .expect(403);
  });

  test('Delete a glossary', async () => {
    await session
      .delete('/api/v1/glossaries/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent glossary', async () => {
    await session
      .delete('/api/v1/glossaries/100')
      .send({})
      .expect(403);
  });
});
