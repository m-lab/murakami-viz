import { validate } from '../../common/schemas/run.js';
import { UnprocessableError } from '../../common/errors.js';

export default class RunManager {
  constructor(db) {
    self._db = db('runs');
  }

  async create(run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to create run: ', err);
    }
    return self._db.insert(run).returning('*');
  }

  async update(id, run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to update run: ', err);
    }
    return self._db
      .update(run)
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
