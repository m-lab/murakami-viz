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
