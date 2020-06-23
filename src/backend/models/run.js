import knex from 'knex';
import { validate } from '../../common/schemas/run.js';
import { BadRequestError } from '../../common/errors.js';

export default class RunManager {
  constructor(db) {
    this._db = db;
  }

  async create(run, lid) {
    try {
      await validate(run);
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
        ids = await trx('runs').insert(run);

        if (lids.length > 0) {
          const inserts = ids.map(id => ({ lid: lid[0], rid: id }));
          await trx('library_runs').insert(inserts);
        }
      });
      return ids;
    } catch (err) {
      throw new BadRequestError('Failed to create run: ', err);
    }
  }

  async update(id, run) {
    try {
      await validate(run);
    } catch (err) {
      throw new BadRequestError('Failed to update run: ', err);
    }
    return this._db
      .table('runs')
      .update(run)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('runs')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'runs.id',
    from: from,
    to: to,
    test: test,
    library: library,
  }) {
    const rows = await this._db
      .table('runs')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('DownloadTestStartTime', '>', from);
        }

        if (to) {
          queryBuilder.where('DownloadTestStartTime', '<', to);
        }

        if (test) {
          queryBuilder
            .where({ TestName: test })
            .orWhere({ TestProtocol: test });
        }

        if (library) {
          queryBuilder
            .join('devices', 'devices.deviceid', 'runs.MurakamiDeviceID')
            .join('library_devices', {
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
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('runs')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('runs').select('*');
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
      ids = await trx('runs')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid run ID.');
      }

      await trx('library_runs').insert({ lid: lid, rid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_runs')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ rid: parseInt(id) })
      .returning('*');
  }
}
