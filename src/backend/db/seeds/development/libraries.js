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
          timezone: 'EST',
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
          bandwidth_cap_upload: '400 GB/mo',
          bandwidth_cap_download: '1000 GB/mo',
        },
        {
          id: 2,
          name: 'Mt. Pleasant Library',
          physical_address: '1600 Lamont Street, NW in Washington, DC',
          shipping_address: '1600 Lamont Street, NW in Washington, DC',
          timezone: 'EST',
          coordinates: '38.930, -77.036',
          primary_contact_name: 'John Doe',
          primary_contact_email: 'john@protonmail.com',
          it_contact_name: 'Jimmy Droptables',
          it_contact_email: 'jimmy@protonmail.com',
          opening_hours: 'M-Sa, 8:00 AM - 6:00 PM',
          network_name: 'Staff',
          isp: 'Verizon',
          contracted_speed_upload: '40 Mbit/s',
          contracted_speed_download: '40 Mbit/s',
          bandwidth_cap_upload: '1000 GB/mo',
          bandwidth_cap_download: '1000 GB/mo',
        },
      ]);
    });
}
