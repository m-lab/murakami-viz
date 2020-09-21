import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:device');

export default class DeviceManager {
  constructor(db) {
    this._db = db;
  }

  async create(device, lid) {
    try {
      let devices;
      await this._db.transaction(async trx => {
        let library;
        if (lid) {
          library = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) })
            .first();
          if (!library) {
            throw new BadRequestError('Invalid library ID.');
          }
        }
        devices = await trx('devices')
          .insert(device)
          .returning('id', 'created_at', 'updated_at');

        // workaround for sqlite
        if (Number.isInteger(devices[0])) {
          devices = await trx('devices')
            .select('id', 'created_at', 'updated_at')
            .whereIn('id', devices);
        }

        if (library) {
          const inserts = devices.map(d => ({
            lid: lid[0],
            did: d.id,
          }));
          await trx('library_devices').insert(inserts);
        }
      });
      return devices;
    } catch (err) {
      throw new BadRequestError('Failed to create device: ', err);
    }
  }

  async update(id, device) {
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('devices')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('devices')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('devices')
            .insert({ ...device, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('devices')
            .insert({ ...device, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('devices')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(`Failed to update device with ID ${id}: `, err);
    }
  }

  async delete(id) {
    return this._db
      .table('devices')
      .del()
      .where({ id: parseInt(id) });
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'devices.id',
    from: from,
    to: to,
    library: library,
  }) {
    const rows = await this._db
      .table('devices')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_devices', {
            'devices.id': 'library_devices.did',
            'library_devices.lid': this._db.raw('?', [library]),
          });
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
      });

    return rows || [];
  }

  async findById(id, library) {
    return this._db
      .table('devices')
      .select('*')
      .where({ id: parseInt(id) })
      .modify(queryBuilder => {
        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_devices', {
            'devices.id': 'library_devices.did',
            'library_devices.lid': this._db.raw('?', [library]),
          });
        }
      });
  }

  async findAll() {
    return this._db.table('devices').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      const library = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) })
        .first();

      if (!library) {
        throw new NotFoundError('Invalid library ID.');
      }

      const device = await trx('devices')
        .select()
        .where({ id: parseInt(id) })
        .first();

      if (!device) {
        throw new NotFoundError('Invalid device ID.');
      }

      await trx('library_devices').insert({ lid: lid, did: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_devices')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ did: parseInt(id) });
  }
}
