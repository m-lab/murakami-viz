import { validate } from '../../common/schemas/note.js';
import { UnprocessableError } from '../../common/errors.js';

export default class NoteManager {
  constructor(db) {
    this._db = db;
  }

  async create(note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to create note: ', err);
    }
    return this._db
      .table('notes')
      .insert(note)
      .returning('*');
  }

  async update(id, note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to update note: ', err);
    }
    return this._db
      .table('notes')
      .update(note)
      .where({ id: parseInt(id) })
      .update({
        subject: note.subject,
        description: note.description,
        updated_at: note.updated_at,
       }, ['id', 'subject', 'description', 'updated_at'])
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('notes')
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
    author: author,
  }) {
    const rows = await this._db
      .table('notes')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (author) {
          queryBuilder.where('author', '=', author);
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
      .table('notes')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('notes').select('*');
  }
}
