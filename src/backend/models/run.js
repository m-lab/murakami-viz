import knex from 'knex';
import { validate } from '../../common/schemas/run.js';
import { UnprocessableError } from '../../common/errors.js';

export default class RunManager {
  constructor(db) {
    this._db = db;
  }

  async create(run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to create run: ', err);
    }
    return this._db
      .table('runs')
      .insert(run)
      .returning('*');
  }

  async update(id, run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to update run: ', err);
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
    sort_by: sort_by = 'id',
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
          //if (
          //  !test.match(
          //    '/^(ndt5|ndt7|dash|speedtest-cli-single-stream|speedtest-cli-multi-stream)$/',
          //  )
          //) {
          //  return [];
          //}
          queryBuilder
            .where({ TestName: test })
            .orWhere({ TestProtocol: test });
        }

        if (library) {
          queryBuilder.join(
            'library_runs',
            'library_runs.lid',
            knex.raw('?', [library]),
          );
        }

        if (asc) {
          console.log('ascending');
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          console.log('descending');
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
}
