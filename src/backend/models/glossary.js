import { BadRequestError } from '../../common/errors.js';

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
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('glossaries')
          .select('*')
          .where({ id: parseInt(id) });

        if (Array.isArray(existing) && existing.length > 0) {
          await trx('glossaries')
            .update(glossary)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('glossaries').insert({ ...glossary, id: id });
          existing = false;
        }
      });
      return existing;
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
