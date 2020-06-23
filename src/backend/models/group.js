import { isString } from '../../common/utils.js';
import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:group');
/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class Group {
  constructor(db) {
    this._db = db;
  }

  async create(group) {
    return this._db
      .table('groups')
      .insert(group)
      .returning('*');
  }

  async update(id, group) {
    try {
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('groups')
          .select('*')
          .where({ id: parseInt(id) });

        if (Array.isArray(existing) && existing.length > 0) {
          await trx('groups')
            .update(group)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('groups').insert({ ...group, id: id });
          existing = false;
        }
      });
      return existing;
    } catch (err) {
      throw new BadRequestError(`Failed to update group with ID ${id}: `, err);
    }
  }

  async delete(id) {
    return this._db
      .table('groups')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
  }) {
    const rows = await this._db
      .table('groups')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
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

  /**
   * Find group by Id
   *
   * @param {integer} id - Find group by id
   */
  async findById(id) {
    return this._db
      .table('groups')
      .select('*')
      .where({ id: parseInt(id) });
  }

  /**
   * Find group by Id
   *
   * @param {integer} id - Find group by id
   */
  async findByGroupname(name) {
    return this._db
      .table('groups')
      .select('*')
      .where({ name: name })
      .first();
  }

  /**
   * Find group by groupname
   *
   * @param {integer} groupname - Find group by groupname
   */
  async findAll() {
    return this._db.table('groups').select('*');
  }

  async members({ gid: gid, start: start = 0, end: end, asc: asc = true }) {
    const members = await this._db
      .table('user_groups')
      .where({ gid: parseInt(gid) })
      .join('users', 'user_groups.uid', '=', 'users.id')
      .select('*')
      .modify(queryBuilder => {
        if (asc) {
          queryBuilder.orderBy('uid', 'asc');
        } else {
          queryBuilder.orderBy('uid', 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }
      });

    return members || [];
  }

  async memberAdd(gid, uid) {
    return this._db
      .table('user_groups')
      .insert({ gid: parseInt(gid), uid: parseInt(uid) })
      .returning('*');
  }

  async memberRemove(gid, uid) {
    return this._db
      .table('user_groups')
      .del()
      .where({ gid: parseInt(gid), uid: parseInt(uid) })
      .returning('*');
  }

  async isMemberOf(group, uid) {
    log.debug(`Checking if user w/ id ${uid} is a member of group ${group}.`);
    const match = async id => {
      return this._db
        .table('user_groups')
        .select('*')
        .where({ gid: parseInt(id), uid: parseInt(uid) });
    };

    let gid;
    if (isString(group)) {
      const found = await this.findByGroupname(group);
      if (found && found.id) {
        gid = found.id;
      } else {
        return false;
      }
    } else {
      gid = group;
    }
    if (!gid) {
      log.error('Group does not exist: ', group);
      return false;
    }

    const matches = await match(gid);
    log.debug('Matching groups: ', matches);

    return matches.length > 0;
  }
}
