import { validate } from '../../common/schemas/note.js';
import { UnprocessableError } from '../../common/errors.js';

export default class NoteManager {
  constructor(db) {
    self._db = db('notes');
  }

  async create(note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to create note: ', err);
    }
    return self._db.insert(note).returning('*');
  }

  async update(id, note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to update note: ', err);
    }
    return self._db
      .update(note)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  delete(id) {
    return self._db
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  getById(id) {
    return self._db.select('*').where({ id: parseInt(id) });
  }
}
