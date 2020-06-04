import { validate } from '../../common/schemas/glossary.js';
import { BadRequestError } from '../../common/errors.js';

export default class GlossaryManager {
  constructor(db) {
    this._db = db;
  }

  async create(glossary) {
    try {
      await validate(glossary);
    } catch (err) {
      throw new BadRequestError('Failed to create library: ', err);
    }
    return this._db
      .table('glossaries')
      .insert(glossary)
      .returning('*');
  }

  async update(id, glossary) {
    try {
      await validate(glossary);
    } catch (err) {
      throw new BadRequestError('Failed to update glossary: ', err);
    }
    return this._db
      .table('glossaries')
      .update(glossary)
      .where({ id: parseInt(id) })
      .update(
        {
          question: glossary.question,
          answer: glossary.answer,
        },
        ['id', 'question', 'answer'],
      );
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
          queryBuilder.limit(end - start);
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
