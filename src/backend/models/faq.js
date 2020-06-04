import { validate } from '../../common/schemas/faq.js';
import { BadRequestError } from '../../common/errors.js';

export default class FaqManager {
  constructor(db) {
    this._db = db;
  }

  async create(faq) {
    try {
      await validate(faq);
    } catch (err) {
      throw new BadRequestError('Failed to create library: ', err);
    }
    return this._db
      .table('faqs')
      .insert(faq)
      .returning('*');
  }

  async update(id, faq) {
    try {
      await validate(faq);
    } catch (err) {
      throw new BadRequestError('Failed to update faq: ', err);
    }
    return this._db
      .table('faqs')
      .update(faq)
      .where({ id: parseInt(id) })
      .update(
        {
          question: faq.question,
          answer: faq.answer,
        },
        ['id', 'question', 'answer'],
      );
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
          queryBuilder.limit(end - start);
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
