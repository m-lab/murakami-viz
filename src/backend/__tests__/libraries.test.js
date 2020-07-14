import Session from 'supertest-session';
import each from 'jest-each';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validLibrary = {
  name: 'Robot Library',
  physical_address: '100 Robot St, Botsville, US 101010',
  shipping_address: '100 Robot St, Botsville, US 101010',
  timezone: 'EST',
  coordinates: '38.889248, -77.050636',
  primary_contact_name: 'Bender Rodriguez',
  primary_contact_email: 'bender@robotlibrary.org',
  it_contact_name: 'Jim Human',
  it_contact_email: 'notarobot@robotlibrary.org',
  opening_hours: '9-5pm, M-F',
  network_name: 'Public Wifi',
  isp: 'Skynet',
  contracted_speed_upload: '10Mbps',
  contracted_speed_download: '20Mbps',
  bandwidth_cap_upload: '100GB',
  bandwidth_cap_download: '100GB',
};

const validLibrary2 = {
  name: 'Pirate Library',
  physical_address: '100 Pirate St, Arrsville, US 800733',
  shipping_address: '100 Pirate St, Arrsville, US 800733',
  timezone: 'EST',
  coordinates: '38.889248, -77.050636',
  primary_contact_name: 'Anne Bonny',
  primary_contact_email: 'anne@piratelibrary.org',
  it_contact_name: 'Mary Read',
  it_contact_email: 'mary@piratelibrary.org',
  opening_hours: '9-5pm, M-F',
  network_name: 'Public Wifi',
  isp: 'The Pirate Bay',
  contracted_speed_upload: '10Mbps',
  contracted_speed_download: '20Mbps',
  bandwidth_cap_upload: '100GB',
  bandwidth_cap_download: '100GB',
};

const invalidLibrary = {
  name: 0,
  physical_address: 0,
  shipping_address: 0,
  timezone: 0,
  coordinates: 0,
  primary_contact_name: 0,
  primary_contact_email: 0,
  it_contact_name: 0,
  it_contact_email: 0,
  opening_hours: 0,
  network_name: 0,
  isp: 0,
  contracted_speed_upload: 0,
  contracted_speed_download: 0,
  bandwidth_cap_upload: 0,
  bandwidth_cap_download: 0,
};

const ip1 = '192.0.2.1';
const ip2 = '192.0.2.2';

afterAll(async () => {
  return db.destroy();
});

describe('Search libraries as an admin', () => {
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

  test('Search sorted libraries', async () => {
    const ascending = await session.get('/api/v1/libraries').expect(200);
    const descending = await session
      .get('/api/v1/libraries?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit libraries', async () => {
    const first_two = await session
      .get('/api/v1/libraries?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/libraries?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/libraries').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Access IP addresses as an admin', () => {
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

  test('Check for individual IP addresses', async () => {
    await session.get(`/api/v1/libraries/1/ip/${ip1}`).expect(204);
    await session.get(`/api/v1/libraries/2/ip/${ip2}`).expect(204);
    await session.get(`/api/v1/libraries/1/ip/${ip2}`).expect(404);
    await session.get(`/api/v1/libraries/2/ip/${ip1}`).expect(404);
  });

  test('Add IP address to library', async () => {
    const ip3 = '192.0.2.3';
    await session.post(`/api/v1/libraries/1/ip/${ip3}`).expect(201);
    await session.get(`/api/v1/libraries/1/ip/${ip3}`).expect(204);
  });

  test('Get all IP addresses', async () => {
    const ips1 = await session.get(`/api/v1/libraries/1/ip`).expect(200);
    const ips2 = await session.get(`/api/v1/libraries/2/ip`).expect(200);
    expect(ips1.body.data).toEqual(
      expect.arrayContaining([{ lid: 1, ip: '192.0.2.1' }]),
    );
    expect(ips2.body.data).toEqual(
      expect.arrayContaining([{ lid: 2, ip: '192.0.2.2' }]),
    );
  });
});

describe('Manage libraries as an admin', () => {
  const validLibraryResponse = {
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

  test('Create library successfully', async () => {
    const res = await session
      .post('/api/v1/libraries')
      .send({ data: [validLibrary] })
      .expect(201);
    expect(res.body).toMatchObject(validLibraryResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const library = await session
      .get(`/api/v1/libraries/${res.body.data[0].id}`)
      .expect(200);
    expect(library.body.data[0]).toMatchObject(validLibrary);
  });

  each(
    Object.entries(invalidLibrary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to create library with invalid attribute %p',
    async invalid => {
      await session
        .post('/api/v1/libraries')
        .send({ data: [{ ...validLibrary, ...invalid }] })
        .expect(400);
    },
  );

  test('Attempt to create an empty library', async () => {
    await session
      .post('/api/v1/libraries')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validLibrary).map(([key, value]) => [{ [`${key}`]: value }]),
  ).test('Edit a library with attribute %p', async attribute => {
    await session
      .put('/api/v1/libraries/1')
      .send({ data: [{ ...validLibrary2, ...attribute }] })
      .expect(204);
  });

  each(
    Object.entries(invalidLibrary).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a library with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/libraries/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a library that does not exist', async () => {
    await session
      .put('/api/v1/libraries/99')
      .send({ data: validLibrary })
      .expect(201);
  });

  test('Delete a library', async () => {
    await session.delete('/api/v1/libraries/1').expect(204);
  });

  test('Attempt to delete a nonexistent library', async () => {
    await session.delete('/api/v1/libraries/100').expect(404);
  });
});

describe('Access libraries as an editor', () => {
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

  test('Attempt to create a library unsuccessfully', async () => {
    await session
      .post('/api/v1/libraries')
      .send({ data: [validLibrary] })
      .expect(403);
  });

  test('Attempt to create an empty library', async () => {
    await session
      .post('/api/v1/libraries')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries({ ...validLibrary, libraryid: uuidv4() }).map(
      ([key, value]) => [{ [`${key}`]: value }],
    ),
  ).test('Edit a library with attribute %p', async attribute => {
    await session
      .put('/api/v1/libraries/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a library that does not exist', async () => {
    await session
      .put('/api/v1/libraries/99')
      .send({ data: validLibrary })
      .expect(403);
  });

  test('Delete a library', async () => {
    await session
      .delete('/api/v1/libraries/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent library', async () => {
    await session
      .delete('/api/v1/libraries/100')
      .send({})
      .expect(403);
  });
});

describe('Access IP addresses as an editor', () => {
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

  test('Check for individual IP addresses', async () => {
    await session.get(`/api/v1/libraries/1/ip/${ip1}`).expect(403);
    await session.get(`/api/v1/libraries/2/ip/${ip2}`).expect(204);
    await session.get(`/api/v1/libraries/1/ip/${ip2}`).expect(403);
    await session.get(`/api/v1/libraries/2/ip/${ip1}`).expect(404);
  });

  test('Add IP address to library', async () => {
    const ip3 = '192.0.2.3';
    await session.post(`/api/v1/libraries/2/ip/${ip3}`).expect(201);
    await session.get(`/api/v1/libraries/2/ip/${ip3}`).expect(204);
  });

  test('Get all IP addresses', async () => {
    await session.get(`/api/v1/libraries/1/ip`).expect(403);
    const ips2 = await session.get(`/api/v1/libraries/2/ip`).expect(200);
    expect(ips2.body.data).toEqual(
      expect.arrayContaining([{ lid: 2, ip: '192.0.2.2' }]),
    );
  });
});

describe('Access libraries as a viewer', () => {
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

  test('Attempt to create a library unsuccessfully', async () => {
    await session
      .post('/api/v1/libraries')
      .send({ data: [validLibrary] })
      .expect(403);
  });

  test('Attempt to create an empty library', async () => {
    await session
      .post('/api/v1/libraries')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries({ ...validLibrary, libraryid: uuidv4() }).map(
      ([key, value]) => [{ [`${key}`]: value }],
    ),
  ).test('Edit a library with attribute %p', async attribute => {
    await session
      .put('/api/v1/libraries/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a library that does not exist', async () => {
    await session
      .put('/api/v1/libraries/99')
      .send({ data: validLibrary })
      .expect(403);
  });

  test('Delete a library', async () => {
    await session
      .delete('/api/v1/libraries/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent library', async () => {
    await session
      .delete('/api/v1/libraries/100')
      .send({})
      .expect(403);
  });
});

describe('Access IP addresses as a viewer', () => {
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

  test('Attempt to check for individual IP addresses', async () => {
    await session.get(`/api/v1/libraries/1/ip/${ip1}`).expect(403);
    await session.get(`/api/v1/libraries/2/ip/${ip2}`).expect(403);
  });

  test('Attempt to add IP address to library', async () => {
    const ip3 = '192.0.2.3';
    await session.post(`/api/v1/libraries/1/ip/${ip3}`).expect(403);
  });

  test('Get all IP addresses', async () => {
    const ips1 = await session.get(`/api/v1/libraries/1/ip`).expect(200);
    await session.get(`/api/v1/libraries/2/ip`).expect(403);
    expect(ips1.body.data).toEqual(
      expect.arrayContaining([{ lid: 1, ip: '192.0.2.1' }]),
    );
  });
});
