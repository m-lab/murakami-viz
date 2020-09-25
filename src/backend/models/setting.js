import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:setting');

export default class SettingManager {
  constructor(db) {
    this._db = db;
  }

  async update(key, setting) {
    try {
      let existing;
      await this._db.transaction(async trx => {
        existing = await trx('settings')
          .select('*')
          .where({ key: key })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('settings')
            .del()
            .where({ key: key });
          log.debug('Entry exists, inserting new version.');
          await trx('settings').insert({ key: key, value: setting.value });
        } else {
          log.debug('Entry does not already exist, inserting.');
          await trx('settings').insert({ key: key, value: setting.value });
        }
      });
      return !!existing;
    } catch (err) {
      throw new BadRequestError(`Failed to update value with ID ${key}: `, err);
    }
  }

  async delete(key) {
    return this._db
      .table('settings')
      .del()
      .where({ key: key });
  }

  async findById(key) {
    return this._db
      .table('settings')
      .select('*')
      .where({ key: key });
  }

  async findAll() {
    return this._db.table('settings').select('*');
  }
}
