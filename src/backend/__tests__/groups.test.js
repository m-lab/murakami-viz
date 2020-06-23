import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validGroup = {
  name: 'superadmins',
};

const validGroup2 = {
  name: 'ultraadmins',
};

const validGroup3 = {
  name: 'hyperadmins',
};

const invalidGroup = {
  name: undefined,
};

afterAll(async () => {
  return db.destroy();
});

describe('Search groups as an admin', () => {
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

  test('Search sorted groups', async () => {
    const ascending = await session.get('/api/v1/groups').expect(200);
    const descending = await session
      .get('/api/v1/groups?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit groups', async () => {
    const first_two = await session
      .get('/api/v1/groups?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/groups?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/groups').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Manage groups as an admin', () => {
  const validGroupResponse = {
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

  test('Create group successfully', async () => {
    const res = await session
      .post('/api/v1/groups')
      .send({ data: [validGroup] })
      .expect(201);
    expect(res.body).toMatchObject(validGroupResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const group = await session
      .get(`/api/v1/groups/${res.body.data[0].id}`)
      .expect(200);
    expect(group.body.data[0]).toMatchObject(validGroup);
  });

  each(
    Object.entries(invalidGroup).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Attempt to create group with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/groups')
      .send({ data: [{ ...validGroup, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty group', async () => {
    await session
      .post('/api/v1/groups')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validGroup2).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a group with attribute %p', async attribute => {
    await session
      .put('/api/v1/groups/2')
      .send({ data: attribute })
      .expect(204);
  });

  each(
    Object.entries(invalidGroup).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test(
    'Attempt to edit a group with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/groups/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a group that does not exist', async () => {
    await session
      .put('/api/v1/groups/99')
      .send({ data: validGroup3 })
      .expect(201);
  });

  test('Delete a group', async () => {
    await session.delete('/api/v1/groups/3').expect(204);
  });

  test('Attempt to delete a nonexistent group', async () => {
    await session.delete('/api/v1/groups/100').expect(404);
  });

  test('Get members of group', async () => {
    let res = await session.get('/api/v1/groups/1').expect(200);
    expect(res.body.data.length).toEqual(1);
  });

  test('Add user to group', async () => {
    let before = await session.get('/api/v1/groups/2/members').expect(200);
    await session.put('/api/v1/groups/2/members/1').expect(204);
    let after = await session.get('/api/v1/groups/2/members').expect(200);
    expect(after.body.data.length).toEqual(before.body.data.length + 1);
  });

  test('Delete user from group', async () => {
    let before = await session.get('/api/v1/groups/2/members').expect(200);
    await session.delete('/api/v1/groups/2/members/2').expect(200);
    let after = await session.get('/api/v1/groups/2/members').expect(200);
    expect(after.body.data.length).toEqual(before.body.data.length - 1);
  });
});

describe('Access groups as an editor', () => {
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

  test('Attempt to create a group unsuccessfully', async () => {
    await session
      .post('/api/v1/groups')
      .send({ data: [validGroup] })
      .expect(403);
  });

  test('Attempt to create an empty group', async () => {
    await session
      .post('/api/v1/groups')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validGroup2).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a group with attribute %p', async attribute => {
    await session
      .put('/api/v1/groups/2')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a group that does not exist', async () => {
    await session
      .put('/api/v1/groups/99')
      .send({ data: validGroup3 })
      .expect(403);
  });

  test('Delete a group', async () => {
    await session
      .delete('/api/v1/groups/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent group', async () => {
    await session
      .delete('/api/v1/groups/100')
      .send({})
      .expect(403);
  });

  test('Get members of group', async () => {
    await session.get('/api/v1/groups/1/members').expect(403);
  });

  test('Add user to group', async () => {
    await session.put('/api/v1/groups/2/members/1').expect(403);
  });

  test('Delete user from group', async () => {
    await session.delete('/api/v1/groups/2/members/2').expect(403);
  });
});

describe('Access groups as a viewer', () => {
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

  test('Attempt to create a group unsuccessfully', async () => {
    await session
      .post('/api/v1/groups')
      .send({ data: [validGroup] })
      .expect(403);
  });

  test('Attempt to create an empty group', async () => {
    await session
      .post('/api/v1/groups')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validGroup2).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a group with attribute %p', async attribute => {
    await session
      .put('/api/v1/groups/2')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a group that does not exist', async () => {
    await session
      .put('/api/v1/groups/99')
      .send({ data: validGroup3 })
      .expect(403);
  });

  test('Delete a group', async () => {
    await session
      .delete('/api/v1/groups/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent group', async () => {
    await session
      .delete('/api/v1/groups/100')
      .send({})
      .expect(403);
  });

  test('Get members of group', async () => {
    await session.get('/api/v1/groups/1/members').expect(403);
  });

  test('Add user to group', async () => {
    await session.put('/api/v1/groups/2/members/1').expect(403);
  });

  test('Delete user from group', async () => {
    await session.delete('/api/v1/groups/2/members/2').expect(403);
  });
});
