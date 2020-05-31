import knex from 'knex';
import { validate } from '../../common/schemas/note.js';
import { BadRequestError } from '../../common/errors.js';

export default class NoteManager {
  constructor(db) {
    this._db = db;
  }

  async create(note, lid) {
    try {
      await validate(note);
      let ids;
      await this._db.transaction(async trx => {
        let lids = [];
        if (lid) {
          lids = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) });
          if (lids.length === 0) {
            throw new BadRequestError('Invalid library ID.');
          }
        }
        ids = await trx('notes').insert(note);

        if (lids.length > 0) {
          const inserts = ids.map(id => ({ lid: lid[0], nid: id }));
          await trx('library_notes').insert(inserts);
        }
      });
      return ids;
    } catch (err) {
      throw new BadRequestError('Failed to create note: ', err);
    }
  }

  async update(id, note) {
    try {
      await validate(note);
    } catch (err) {
      throw new BadRequestError('Failed to update note: ', err);
    }
    return this._db
      .table('notes')
      .update(note)
      .where({ id: parseInt(id) })
      .update(
        {
          subject: note.subject,
          description: note.description,
          updated_at: note.updated_at,
        },
        ['id', 'subject', 'description', 'updated_at'],
      )
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
    library: library,
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

        if (library) {
          queryBuilder.join(
            'library_notes',
            'library_notes.lid',
            knex.raw('?', [library]),
          );
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
      .table('notes')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('notes').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      let lids = [];
      lids = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) });

      if (lids.length === 0) {
        throw new BadRequestError('Invalid library ID.');
      }

      let ids = [];
      ids = await trx('notes')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid note ID.');
      }

      await trx('library_notes').insert({ lid: lid, nid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_notes')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ nid: parseInt(id) })
      .returning('*');
  }
}
