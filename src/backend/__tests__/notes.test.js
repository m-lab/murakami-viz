import Session from 'supertest-session';
import each from 'jest-each';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validNote = {
  subject: 'This is a note!',
  description: 'Check, please!',
};

const invalidNote = {
  subject: 0,
  description: 0,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search notes as an admin', () => {
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

  test('Search sorted notes', async () => {
    const ascending = await session.get('/api/v1/notes').expect(200);
    const descending = await session.get('/api/v1/notes?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit notes', async () => {
    const first_two = await session
      .get('/api/v1/notes?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/notes?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/notes').expect(200);
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
      .get('/api/v1/notes?library=1')
      .expect(200);
    const library_two = await session
      .get('/api/v1/notes?library=2')
      .expect(200);
    const all = await session.get('/api/v1/notes').expect(200);
    expect(all.body.data.length).toEqual(
      library_one.body.data.length + library_two.body.data.length,
    );
  });
});

describe('Manage notes as an admin', () => {
  const validNoteResponse = {
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

  test('Create note successfully', async () => {
    const res = await session
      .post('/api/v1/notes')
      .send({ data: [validNote] })
      .expect(201);
    expect(res.body).toMatchObject(validNoteResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const note = await session
      .get(`/api/v1/notes/${res.body.data[0].id}`)
      .expect(200);
    expect(note.body.data[0]).toMatchObject(validNote);
  });

  each(
    Object.entries(invalidNote).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to create note with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/notes')
      .send({ data: [{ ...validNote, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty note', async () => {
    await session
      .post('/api/v1/notes')
      .send({ data: [] })
      .expect(400);
  });

  test('Edit a note', async () => {
    await session
      .put('/api/v1/notes/1')
      .send({ data: validNote })
      .expect(204);
  });

  each(
    Object.entries(invalidNote).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test(
    'Attempt to edit a note with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/notes/1')
        .send({ data: { ...validNote, attribute } })
        .expect(400);
    },
  );

  test('Attempt to update a note that does not exist', async () => {
    await session
      .put('/api/v1/notes/99')
      .send({ data: validNote })
      .expect(201);
  });

  test('Delete a note', async () => {
    await session.delete('/api/v1/notes/1').expect(204);
  });

  test('Attempt to delete a nonexistent note', async () => {
    await session.delete('/api/v1/notes/100').expect(404);
  });

  test('Verify note does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/notes/3').expect(404);
  });

  test('Add note to library', async () => {
    await session.put('/api/v1/libraries/2/notes/2').expect(204);
    await session.get('/api/v1/libraries/2/notes/2').expect(200);
  });

  test('Remove note from library', async () => {
    await session.delete('/api/v1/libraries/2/notes/3').expect(204);
    await session.get('/api/v1/libraries/2/notes/3').expect(404);
  });
});

describe('Access notes as an editor', () => {
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

  test('Create note successfully', async () => {
    await session
      .post('/api/v1/libraries/2/notes')
      .send({ data: [validNote] })
      .expect(201);
  });

  test('Attempt to create note globally', async () => {
    await session
      .post('/api/v1/notes')
      .send({ data: [validNote] })
      .expect(403);
  });

  test('Attempt to create an empty note', async () => {
    await session
      .post('/api/v1/libraries/2/notes')
      .send({ data: [] })
      .expect(400);
  });

  test('Attempt to edit a note globally', async () => {
    await session
      .put('/api/v1/notes/1')
      .send({ data: validNote })
      .expect(403);
  });

  test('Attempt to update a note that does not exist', async () => {
    await session
      .put('/api/v1/notes/99')
      .send({ data: validNote })
      .expect(403);
  });

  test('Delete a note', async () => {
    await session
      .delete('/api/v1/notes/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent note', async () => {
    await session
      .delete('/api/v1/notes/100')
      .send({})
      .expect(403);
  });

  test('Verify note does not belong to library', async () => {
    await session.get('/api/v1/libraries/2/notes/1').expect(404);
  });

  test('Verify note does belong to library', async () => {
    await session.get('/api/v1/libraries/2/notes/3').expect(200);
  });

  test('Attempt to access notes in different library', async () => {
    await session.get('/api/v1/libraries/1/notes').expect(403);
  });

  test('Attempt to access a note in different library', async () => {
    await session.get('/api/v1/libraries/1/notes/1').expect(403);
  });

  test('Attempt to add note to library', async () => {
    await session.put('/api/v1/libraries/2/notes/2').expect(403);
  });

  test('Attempt to remove note from library', async () => {
    await session.delete('/api/v1/libraries/2/notes/3').expect(204);
  });
});

describe('Access notes as a viewer', () => {
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

  test('Attempt to create a note unsuccessfully', async () => {
    await session
      .post('/api/v1/notes')
      .send({ data: [validNote] })
      .expect(403);
  });

  test('Attempt to create an empty note', async () => {
    await session
      .post('/api/v1/notes')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries({ ...validNote, noteid: uuidv4() }).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a note with attribute %p', async attribute => {
    await session
      .put('/api/v1/notes/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a note that does not exist', async () => {
    await session
      .put('/api/v1/notes/99')
      .send({ data: validNote })
      .expect(403);
  });

  test('Delete a note', async () => {
    await session
      .delete('/api/v1/notes/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent note', async () => {
    await session
      .delete('/api/v1/notes/100')
      .send({})
      .expect(403);
  });

  test('Verify note does not belong to library', async () => {
    await session.get('/api/v1/libraries/1/notes/4').expect(404);
  });

  test('Verify note does belong to library', async () => {
    await session.get('/api/v1/libraries/1/notes/1').expect(200);
  });

  test('Attempt to access notes in different library', async () => {
    await session.get('/api/v1/libraries/2/notes').expect(403);
  });

  test('Attempt to access a note in different library', async () => {
    await session.get('/api/v1/libraries/2/notes/3').expect(403);
  });

  test('Attempt to add note to library', async () => {
    await session.put('/api/v1/libraries/2/notes/2').expect(403);
  });

  test('Attempt to remove note from library', async () => {
    await session.delete('/api/v1/libraries/2/notes/4').expect(403);
  });
});
