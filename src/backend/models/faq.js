import { BadRequestError } from '../../common/errors.js';

export default class FaqManager {
  constructor(db) {
    this._db = db;
  }

  async create(faq) {
    return this._db
      .table('faqs')
      .insert(faq)
      .returning('*');
  }

  async update(id, faq) {
    try {
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('faqs')
          .select('*')
          .where({ id: parseInt(id) });

        if (Array.isArray(existing) && existing.length > 0) {
          await trx('faqs')
            .update(faq)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('faqs').insert({ ...faq, id: id });
          existing = false;
        }
      });
      return existing;
    } catch (err) {
      throw new BadRequestError(`Failed to update faq with ID ${id}: `, err);
    }
  }

  async delete(id) {
    return this._db
      .table('faqs')
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
      .table('faqs')
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
      .table('faqs')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('faqs').select('*');
  }
}
