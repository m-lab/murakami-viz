import { validate } from '../../common/schemas/library.js';
import { UnprocessableError } from '../../common/errors.js';

export default class LibraryManager {
  constructor(db) {
    self._db = db('libraries');
  }

  async create(library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to create library: ', err);
    }
    return self._db.insert(library).returning('*');
  }

  async update(id, library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to update library: ', err);
    }
    return self._db
      .update(library)
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
