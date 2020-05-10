import { validate } from '../../common/schemas/note.js';
import { UnprocessableError } from '../../common/errors.js';

export default class NoteManager {
  constructor(db) {
    this._db = db.table('notes');
  }

  async create(note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to create note: ', err);
    }
    return this._db.insert(note).returning('*');
  }

  async update(id, note) {
    try {
      await validate(note);
    } catch (err) {
      throw new UnprocessableError('Failed to update note: ', err);
    }
    return this._db
      .where({ id: parseInt(id) })
      .update({
        subject: note.subject,
        description: note.description,
        updated_at: note.updated_at,
       }, ['id', 'subject', 'description', 'updated_at'])
      .returning('*');
  }

  delete(id) {
    return this._db
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  findById(id) {
    return this._db.select('*').where({ id: parseInt(id) });
  }

  findAll() {
    return this._db
      .select('*')
      .then(data => {
        return data;
      })
      .catch(err => {
        throw new UnprocessableError('Failed to fetch all notes: ', err);
      });
  }
}
