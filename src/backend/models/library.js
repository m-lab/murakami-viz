import knex from 'knex';
import { validate } from '../../common/schemas/library.js';
import { BadRequestError, UnprocessableError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:model:library');

export default class LibraryManager {
  constructor(db) {
    this._db = db;
  }

  async createIp(lid, ips) {
    let value;
    if (Array.isArray(ips)) {
      value = ips.map(ip => ({ lid: lid, ip: ip }));
    } else {
      value = { lid: lid, ip: ips };
    }
    return this._db
      .table('library_ips')
      .insert(value)
      .returning('*');
  }

  async findIp(lid, ip) {
    const rows = await this._db
      .table('library_ips')
      .select('*')
      .modify(queryBuilder => {
        if (lid) {
          queryBuilder.where({ lid: parseInt(lid) });
          if (ip) {
            queryBuilder.andWhere({ ip: ip });
          }
        } else {
          if (ip) {
            queryBuilder.where({ ip: ip });
          }
        }
      });

    return rows || [];
  }

  async findAllIps() {
    const rows = await this._db.table('library_ips').select('ip');

    return rows || [];
  }

  async deleteIp(lid, ip) {
    if (!(lid || ip)) {
      throw new UnprocessableError('Need to specify either library id or IP.');
    }
    return this._db
      .table('library_ips')
      .del()
      .modify(queryBuilder => {
        if (lid) {
          queryBuilder.where({ lid: parseInt(lid) });
          if (ip) {
            queryBuilder.andWhere({ ip: ip });
          }
        } else {
          if (ip) {
            queryBuilder.where({ ip: ip });
          }
        }
      })
      .returning('*');
  }

  async create(library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to create library: ', err);
    }
    return this._db
      .table('libraries')
      .insert(library)
      .returning('*');
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
          sunday_open: library.sunday_open,
          sunday_close: library.sunday_close,
          monday_open: library.monday_open,
          monday_close: library.monday_close,
          tuesday_open: library.tuesday_open,
          tuesday_close: library.tuesday_close,
          wednesday_open: library.wednesday_open,
          wednesday_close: library.wednesday_close,
          thursday_open: library.thursday_open,
          thursday_close: library.thursday_close,
          friday_open: library.friday_open,
          friday_close: library.friday_close,
          saturday_open: library.saturday_open,
          saturday_close: library.saturday_close,
          network_name: library.network_name,
          isp: library.isp,
          contracted_speed_upload: library.contracted_speed_upload,
          contracted_speed_download: library.contracted_speed_download,
          bandwidth_cap_upload: library.bandwidth_cap_upload,
          bandwidth_cap_download: library.bandwidth_cap_download,
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
          'sunday_open',
          'sunday_close',
          'monday_open',
          'monday_close',
          'tuesday_open',
          'tuesday_close',
          'wednesday_open',
          'wednesday_close',
          'thursday_open',
          'thursday_close',
          'friday_open',
          'friday_close',
          'saturday_open',
          'saturday_close',
          'network_name',
          'isp',
          'contracted_speed_upload',
          'contracted_speed_download',
          'bandwidth_cap_upload',
          'bandwidth_cap_download',
        ],
      )
      .returning('*');
  }

  async delete(id) {
    try {
      await this._db
        .table('libraries')
        .del()
        .where({ id: parseInt(id) });
      return id;
    } catch (err) {
      throw new BadRequestError(
        `Failed to delete library with ID ${id}: `,
        err,
      );
    }
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'libraries.id',
    from: from,
    to: to,
    of_user: of_user,
  }) {
    const rows = await this._db
      .select({
        id: 'libraries.id',
        name: 'libraries.name',
        physical_address: 'libraries.physical_address',
        shipping_address: 'libraries.shipping_address',
        timezone: 'libraries.timezone',
        coordinates: 'libraries.coordinates',
        primary_contact_name: 'libraries.primary_contact_name',
        primary_contact_email: 'libraries.primary_contact_email',
        it_contact_name: 'libraries.it_contact_name',
        it_contact_email: 'libraries.it_contact_email',
        sunday_open: 'libraries.sunday_open',
        sunday_close: 'libraries.sunday_close',
        monday_open: 'libraries.monday_open',
        monday_close: 'libraries.monday_close',
        tuesday_open: 'libraries.tuesday_open',
        tuesday_close: 'libraries.tuesday_close',
        wednesday_open: 'libraries.wednesday_open',
        wednesday_close: 'libraries.wednesday_close',
        thursday_open: 'libraries.thursday_open',
        thursday_close: 'libraries.thursday_close',
        friday_open: 'libraries.friday_open',
        friday_close: 'libraries.friday_close',
        saturday_open: 'libraries.saturday_open',
        saturday_close: 'libraries.saturday_close',
        network_name: 'libraries.network_name',
        isp: 'libraries.isp',
        contracted_speed_upload: 'libraries.contracted_speed_upload',
        contracted_speed_download: 'libraries.contracted_speed_download',
        bandwidth_cap_upload: 'libraries.bandwidth_cap_upload',
        bandwidth_cap_download: 'libraries.bandwidth_cap_download',
      })
      .from('libraries')
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
          queryBuilder.join('library_users', {
            'libraries.id': 'library_users.lid',
            'library_users.uid': knex.raw('?', [of_user]),
          });
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

  async isMemberOf(lid, uid) {
    log.debug(`Checking if user w/ id ${uid} is a member of library ${lid}.`);
    const matches = await this._db
      .table('library_users')
      .select('*')
      .where({ lid: parseInt(lid), uid: parseInt(uid) });

    log.debug('Matching libraries: ', matches);

    return matches.length > 0;
  }
}
