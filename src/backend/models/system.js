import { validate } from '../../common/schemas/system.js';
import { UnprocessableError } from '../../common/errors.js';

export default class SystemManager {
  constructor(db) {
    this._db = db.table('systems');
  }

  async create(system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to create system: ', err);
    }
    return this._db.insert(system).returning('*');
  }

  async update(id, system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to update system: ', err);
    }
    return this._db
      .update(system)
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
