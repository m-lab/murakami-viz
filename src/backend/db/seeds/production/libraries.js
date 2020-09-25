export function seed(knex) {
  return knex('libraries')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('libraries').insert([
        {
          id: 1,
          name: 'Example Library',
          physical_address: '901 G St. NW, Washington, DC 20001',
          shipping_address: '901 G St. NW, Washington, DC 20001',
          timezone: 'EST',
          coordinates: '-77.0366, 38.895',
          primary_contact_name: 'Jane Doe',
          primary_contact_email: 'jane@protonmail.com',
          it_contact_name: 'John Doe',
          it_contact_email: 'john@protonmail.com',
          monday_open: '9:00 a.m.',
          monday_close: '5:00 p.m.',
          tuesday_open: '9:00 a.m.',
          tuesday_close: '5:00 p.m.',
          wednesday_open: '9:00 a.m.',
          wednesday_close: '5:00 p.m.',
          thursday_open: '9:00 a.m.',
          thursday_close: '5:00 p.m.',
          friday_open: '9:00 a.m.',
          friday_close: '5:00 p.m.',
          network_name: 'Public Access',
          isp: 'Comcast',
          contracted_speed_upload: '40 Mbit/s',
          contracted_speed_download: '100 Mbit/s',
          bandwidth_cap_upload: '400 GB/mo',
          bandwidth_cap_download: '1000 GB/mo',
        },
      ]);
    });
}
