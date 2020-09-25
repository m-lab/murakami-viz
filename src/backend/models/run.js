import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:run');

export default class RunManager {
  constructor(db) {
    this._db = db;
  }

  async create(run, lid) {
    try {
      let runs;
      await this._db.transaction(async trx => {
        let library;
        if (lid) {
          library = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) })
            .first();
          if (!library) {
            throw new NotFoundError('Invalid library ID.');
          }
        }
        runs = await trx('runs')
          .insert(run)
          .returning('id', 'created_at', 'updated_at');

        // workaround for sqlite
        if (Number.isInteger(runs[0])) {
          runs = await trx('runs')
            .select('id', 'created_at', 'updated_at')
            .whereIn('id', runs);
        }

        if (library) {
          const inserts = runs.map(r => ({
            lid: library.id,
            rid: r.id,
          }));
          await trx('library_runs').insert(inserts);
        }
      });
      return runs;
    } catch (err) {
      throw new BadRequestError('Failed to create run: ', err);
    }
  }

  async update(id, run) {
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('runs')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('runs')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('runs')
            .insert({ ...run, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('runs')
            .insert({ ...run, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('runs')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(`Failed to update run with ID ${id}: `, err);
    }
  }

  async delete(id) {
    return this._db
      .table('runs')
      .del()
      .where({ id: parseInt(id) });
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
          queryBuilder.limit(end - start + 1);
        }
      });

    return rows || [];
  }

  async findById(id, library) {
    return this._db
      .table('runs')
      .select('*')
      .where({ 'runs.id': parseInt(id) })
      .modify(queryBuilder => {
        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder
            .join('devices', 'devices.deviceid', 'runs.MurakamiDeviceID')
            .join('library_devices', {
              'devices.id': 'library_devices.did',
              'library_devices.lid': this._db.raw('?', [library]),
            });
        }
      });
  }

  async findAll() {
    return this._db.table('runs').select('*');
  }
}
