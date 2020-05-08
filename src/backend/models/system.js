import { validate } from '../../common/schemas/system.js';
import { UnprocessableError } from '../../common/errors.js';

export default class SystemManager {
  constructor(db) {
    self._db = db('systems');
  }

  async create(system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to create system: ', err);
    }
    return self._db.insert(system).returning('*');
  }

  async update(id, system) {
    try {
      await validate(system);
    } catch (err) {
      throw new UnprocessableError('Failed to update system: ', err);
    }
    return self._db
      .update(system)
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
