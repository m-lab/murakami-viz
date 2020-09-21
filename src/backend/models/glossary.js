import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:glossary');

export default class GlossaryManager {
  constructor(db) {
    this._db = db;
  }

  async create(glossary) {
    return this._db
      .table('glossaries')
      .insert(glossary)
      .returning('*');
  }

  async update(id, glossary) {
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('glossaries')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('glossaries')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('glossaries')
            .insert({ ...glossary, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('glossaries')
            .insert({ ...glossary, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('glossaries')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(
        `Failed to update glossary with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('glossaries')
      .del()
      .where({ id: parseInt(id) });
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
      .table('glossaries')
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
          queryBuilder.limit(end - start + 1);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('glossaries')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('glossaries').select('*');
  }
}
