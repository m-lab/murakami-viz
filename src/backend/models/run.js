import { validate } from '../../common/schemas/run.js';
import { UnprocessableError } from '../../common/errors.js';

export default class RunManager {
  constructor(db) {
    this._db = db.table('runs');
  }

  async create(run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to create run: ', err);
    }
    return this._db.insert(run).returning('*');
  }

  async update(id, run) {
    try {
      await validate(run);
    } catch (err) {
      throw new UnprocessableError('Failed to update run: ', err);
    }
    return this._db
      .update(run)
      .where({ id: parseInt(id) })
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
    return this._db.select('*');
  }
}
