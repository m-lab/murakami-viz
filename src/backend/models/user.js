import bcrypt from 'bcryptjs';
import { validate } from '../../common/schemas/user.js';
import { BadRequestError } from '../../common/errors.js';

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class User {
  constructor(db) {
    this._db = db;
  }

  async create(user, lid) {
    try {
      await validate(user);
      let ids;
      await this._db.transaction(async trx => {
        let lids = [];
        if (lid) {
          lids = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) });
          if (lids.length === 0) {
            throw new BadRequestError('Invalid library ID.');
          }
        }
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
        ids = await trx('users').insert(user);

        if (lids.length > 0) {
          const inserts = ids.map(id => ({ lid: lid[0], uid: id }));
          await trx('library_users').insert(inserts);
        }
      });
      return ids;
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }

  async update(id, user) {
    try {
      await validate(user);
    } catch (err) {
      throw new BadRequestError('Failed to update user: ', err);
    }
    return this._db
      .table('users')
      .update(user)
      .where({ id: parseInt(id) })
      .update(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        },
        ['id', 'firstName', 'lastName', 'username', 'email', 'password'],
      )
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('users')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'users.id',
    from: from,
    to: to,
    library: library,
    group: group,
  }) {
    const rows = await this._db
      .select({
        id: 'users.id',
        username: 'users.username',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        location: 'libraries.id',
        location_name: 'libraries.name',
        location_address: 'libraries.physical_address',
        role: 'groups.id',
        role_name: 'groups.name',
        email: 'users.email',
        isActive: 'users.isActive',
      })
      .from('users')
      .leftJoin('library_users', 'users.id', 'library_users.uid')
      .leftJoin('libraries', 'libraries.id', 'library_users.lid')
      .leftJoin('user_groups', 'users.id', 'user_groups.uid')
      .leftJoin('groups', 'groups.id', 'user_groups.gid')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (library) {
          queryBuilder.where('location', '=', library);
        }

        if (group) {
          queryBuilder.where('role', '=', group);
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
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findById(id) {
    return this._db
      .select({
        id: 'users.id',
        username: 'users.username',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        location: 'libraries.id',
        location_name: 'libraries.name',
        location_address: 'libraries.physical_address',
        role: 'groups.id',
        role_name: 'groups.name',
        email: 'users.email',
        isActive: 'users.isActive',
      })
      .from('users')
      .leftJoin('library_users', 'users.id', 'library_users.uid')
      .leftJoin('libraries', 'libraries.id', 'library_users.lid')
      .leftJoin('user_groups', 'users.id', 'user_groups.uid')
      .leftJoin('groups', 'groups.id', 'user_groups.gid')
      .where({ 'users.id': parseInt(id) });
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findByUsername(username, privileged = false) {
    if (privileged) {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          password: 'users.password',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.username': username })
        .first();
    } else {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.username': username })
        .first();
    }
  }

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  async findAll() {
    return this._db.table('users').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      let lids = [];
      lids = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) });

      if (lids.length === 0) {
        throw new BadRequestError('Invalid library ID.');
      }

      let ids = [];
      ids = await trx('users')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid user ID.');
      }

      await trx('library_users').insert({ lid: lid, uid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_users')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ uid: parseInt(id) })
      .returning('*');
  }
}
