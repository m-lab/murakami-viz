import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:model:note');

export default class NoteManager {
  constructor(db) {
    this._db = db;
  }

  async create(note, lid) {
    try {
      let notes;
      await this._db.transaction(async trx => {
        let library;
        if (lid) {
          library = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) })
            .first();
          if (!library) {
            throw new NotFoundError('Invalid library ID.');
          }
        }
        notes = await trx('notes')
          .insert(note)
          .returning('id', 'created_at', 'updated_at');

        // workaround for sqlite
        if (Number.isInteger(notes[0])) {
          notes = await trx('notes')
            .select('id', 'created_at', 'updated_at')
            .whereIn('id', notes);
        }

        if (library) {
          const inserts = notes.map(n => ({
            lid: lid[0],
            nid: n.id,
          }));
          await trx('library_notes').insert(inserts);
        }
      });
      return notes;
    } catch (err) {
      throw new BadRequestError('Failed to create note: ', err);
    }
  }

  async update(id, note) {
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('notes')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('notes')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('notes')
            .insert({ ...note, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('notes')
            .insert({ ...note, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('notes')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(`Failed to update note with ID ${id}: `, err);
    }
  }

  async delete(id) {
    return this._db
      .table('notes')
      .del()
      .where({ id: parseInt(id) });
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'notes.id',
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
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_notes', {
            'notes.id': 'library_notes.nid',
            'library_notes.lid': this._db.raw('?', [library]),
          });
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

  async findById(id, library) {
    return this._db
      .table('notes')
      .select('*')
      .where({ id: parseInt(id) })
      .modify(queryBuilder => {
        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_notes', {
            'notes.id': 'library_notes.nid',
            'library_notes.lid': this._db.raw('?', [library]),
          });
        }
      });
  }

  async findAll() {
    return this._db.table('notes').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      const library = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) })
        .first();

      if (!library) {
        throw new NotFoundError('Invalid library ID.');
      }

      const note = await trx('notes')
        .select()
        .where({ id: parseInt(id) })
        .first();

      if (!note) {
        throw new NotFoundError('Invalid note ID.');
      }

      await trx('library_notes').insert({ lid: lid, nid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_notes')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ nid: parseInt(id) });
  }
}
