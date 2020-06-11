import knex from 'knex';
import { validate } from '../../common/schemas/device.js';
import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:device');

export default class DeviceManager {
  constructor(db) {
    this._db = db;
  }

  async create(device, lid) {
    try {
      await validate(device);
      let ids;
      await this._db.transaction(async trx => {
        let lids = [];
        if (lid) {
          lids = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) });
          if (lids.length === 0) {
            throw new BadRequestError('Invalid library ID.');
          }
        }
        ids = await trx('devices').insert(device);

        if (lids.length > 0) {
          const inserts = ids.map(id => ({ lid: lid[0], did: id }));
          await trx('library_devices').insert(inserts);
        }
      });
      return ids;
    } catch (err) {
      throw new BadRequestError('Failed to create device: ', err);
    }
  }

  async update(id, device) {
    try {
      await validate(device);
    } catch (err) {
      throw new BadRequestError('Failed to update device: ', err);
    }
    return this._db
      .table('devices')
      .update(device)
      .where({ id: parseInt(id) })
      .update(
        {
          subject: device.subject,
          description: device.description,
          updated_at: device.updated_at,
        },
        ['id', 'subject', 'description', 'updated_at'],
      );
  }

  async delete(id) {
    try {
      let ids;
      await this._db.transaction(async trx => {
        ids = await trx('devices')
          .del()
          .where({ id: parseInt(id) });
        //await trx('library_devices')
        //  .del()
        //  .where({ did: parseInt(id) });
      });
      return ids;
    } catch (err) {
      throw new BadRequestError(`Failed to delete device with ID ${id}: `, err);
    }
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'device.id',
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
            'library_devices.lid': knex.raw('?', [library]),
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
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('devices')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('devices').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      let lids = [];
      lids = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) });

      if (lids.length === 0) {
        throw new BadRequestError('Invalid library ID.');
      }

      let ids = [];
      ids = await trx('devices')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid device ID.');
      }

      await trx('library_devices').insert({ lid: lid, did: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_devices')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ did: parseInt(id) })
      .returning('*');
  }
}
