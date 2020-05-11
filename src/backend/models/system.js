import { validate } from '../../common/schemas/system.js';
import { UnprocessableError } from '../../common/errors.js';

export default class SystemManager {
  constructor(db) {
    this._db = db;
  }

  async create(system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to create system: ', err);
    }
    return this._db
      .table('systems')
      .insert(system)
      .returning('*');
  }

  async update(id, system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to update system: ', err);
    }
    return this._db
      .table('systems')
      .update(system)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('systems')
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
      .table('systems')
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
      .table('systems')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.tables('systems').select('*');
  }
}
