import { validate } from '../../common/schemas/library.js';
import { UnprocessableError } from '../../common/errors.js';

export default class LibraryManager {
  constructor(db) {
    this._db = db.table('libraries');
  }

  async create(library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to create library: ', err);
    }
    return this._db.insert(library).returning('*');
  }

  async update(id, library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to update library: ', err);
    }
    return this._db
      .update(library)
      .where({ id: parseInt(id) })
      .returning('*');
  }

  delete(id) {
    return this._db
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  getById(id) {
    return this._db.select('*').where({ id: parseInt(id) });
  }
}
