import { BadRequestError } from '../../common/errors.js';
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
      throw new BadRequestError('Need to specify either library id or IP.');
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
      });
  }

  async create(library) {
    return this._db
      .table('libraries')
      .insert(library)
      .returning('*');
  }

  async update(id, library) {
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('libraries')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('libraries')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('libraries')
            .insert({ ...library, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('libraries')
            .insert({ ...library, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('libraries')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(
        `Failed to update library with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('libraries')
      .del()
      .where({ id: parseInt(id) });
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
          queryBuilder.limit(end - start + 1);
        }

        if (of_user) {
          queryBuilder.join('library_users', {
            'libraries.id': 'library_users.lid',
            'library_users.uid': this._db.raw('?', [of_user]),
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
