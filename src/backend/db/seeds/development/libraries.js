export function seed(knex) {
  return knex('libraries')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('libraries').insert([
        {
          id: 1,
          name: 'MLK Library',
          physical_address: '901 G St. NW, Washington, DC 20001',
          shipping_address: '901 G St. NW, Washington, DC 20001',
          timezone: 'utc',
          coordinates: '-77.0366, 38.895',
          primary_contact_name: 'Jane Doe',
          primary_contact_email: 'jane@protonmail.com',
          it_contact_name: 'James Brown',
          it_contact_email: 'james@protonmail.com',
          opening_hours: 'M-F, 9:00 AM - 5:00 PM',
          network_name: 'Public Access',
          isp: 'Comcast',
          contracted_speed_upload: '40 Mbit/s',
          contracted_speed_download: '100 Mbit/s',
          bandwith_cap_upload: '40 Mbit/s',
          bandwith_cap_download: '100 Mbit/s',
        },
      ]);
    });
}
