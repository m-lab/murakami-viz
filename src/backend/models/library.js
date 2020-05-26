import knex from 'knex';
import { validate } from '../../common/schemas/library.js';
import { UnprocessableError } from '../../common/errors.js';

export default class LibraryManager {
  constructor(db) {
    this._db = db;
  }

  async create(library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to create library: ', err);
    }
    return this._db.insert(library).returning('*');
  }

  async update(id, library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to update library: ', err);
    }
    return this._db
      .table('libraries')
      .update(library)
      .where({ id: parseInt(id) })
      .update(
        {
          physical_address: library.physical_address,
          shipping_address: library.shipping_address,
          timezone: library.timezone,
          coordinates: library.coordinates,
          primary_contact_name: library.primary_contact_name,
          primary_contact_email: library.primary_contact_email,
          it_contact_name: library.it_contact_name,
          it_contact_email: library.it_contact_email,
          opening_hours: library.opening_hours,
          network_name: library.network_name,
          isp: library.isp,
          contracted_speed_upload: library.contracted_speed_upload,
          contracted_speed_download: library.contracted_speed_download,
          bandwith_cap_upload: library.bandwith_cap_upload,
          bandwith_cap_download: library.bandwith_cap_download,
          device_name: library.device_name,
          device_location: library.device_location,
          device_network_type: library.device_network_type,
          device_connection_type: library.device_connection_type,
          device_dns: library.device_dns,
          device_ip: library.device_ip,
          device_gateway: library.device_gateway,
          device_mac_address: library.device_mac_address,
        },
        [
          'id',
          'physical_address',
          'shipping_address',
          'timezone',
          'coordinates',
          'primary_contact_name',
          'primary_contact_email',
          'it_contact_name',
          'it_contact_email',
          'opening_hours',
          'network_name',
          'isp',
          'contracted_speed_upload',
          'contracted_speed_download',
          'ip',
          'bandwith_cap_upload',
          'bandwith_cap_download',
          'device_name',
          'device_location',
          'device_network_type',
          'device_connection_type',
          'device_dns',
          'device_ip',
          'device_gateway',
          'device_mac_address',
        ],
      )
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('libraries')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
    of_user: of_user,
  }) {
    const rows = await this._db
      .table('libraries')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }

        if (of_user) {
          queryBuilder.join(
            'library_users',
            'library_users.uid',
            knex.raw('?', [of_user]),
          );
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('libraries')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('libraries').select('*');
  }
}
