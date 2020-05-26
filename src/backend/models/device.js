import knex from 'knex';
import { validate } from '../../common/schemas/device.js';
import { UnprocessableError } from '../../common/errors.js';

export default class DeviceManager {
  constructor(db) {
    this._db = db;
  }

  async create(device) {
    try {
      await validate(device);
    } catch (err) {
      throw new UnprocessableError('Failed to create device: ', err);
    }
    return this._db
      .table('devices')
      .insert(device)
      .returning('*');
  }

  async update(id, device) {
    try {
      await validate(device);
    } catch (err) {
      throw new UnprocessableError('Failed to update device: ', err);
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
      )
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('devices')
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
          queryBuilder.join(
            'library_devices',
            'library_devices.lid',
            knex.raw('?', [library]),
          );
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
}
