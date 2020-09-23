import bcrypt from 'bcryptjs';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:user');

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

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
      let users;
      await this._db.transaction(async trx => {
        let group, library;
        const role = user.role;

        const query = {
          username: user.username,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          extension: user.extension,
          isActive: user.isActive || true,
        };

        if (user.password) {
          const salt = bcrypt.genSaltSync();
          query.password = bcrypt.hashSync(user.password, salt);
        }

        log.debug('*** USER ***:', user);
        log.debug('*** QUERY ***:', query);
        await trx('users').insert(query);

        users = await trx('users')
          .select('id', 'created_at', 'updated_at')
          .where({ username: user.username });

        if (lid) {
          library = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) })
            .first();
          if (!library) {
            throw new NotFoundError('Invalid library ID.');
          }

          const library_inserts = users.map(u => ({
            lid: library.id,
            uid: u.id,
          }));
          await trx('library_users').insert(library_inserts);
        }

        if (role) {
          group = await trx('groups')
            .select()
            .where({ id: parseInt(role) })
            .first();
          if (!group) {
            throw new NotFoundError('Invalid group ID.');
          }

          const group_inserts = users.map(u => ({
            lid: group.id,
            uid: u.id,
          }));
          await trx('user_groups').insert(group_inserts);
        }
      });
      return users;
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }

  async update(id, user) {
    try {
      let existing, role, updated;
      let exists = false;
      if (user.role) {
        role = user.role;
      }
      const query = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        extension: user.extension,
        isActive: user.isActive,
      };
      if (user.password) {
        const salt = bcrypt.genSaltSync();
        query.password = bcrypt.hashSync(user.password, salt);
      }
      await this._db.transaction(async trx => {
        existing = await trx('users')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('users')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('users')
            .insert({ ...query, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
          if (role) {
            await trx('user_groups').insert({
              gid: user.role,
              uid: parseInt(id),
            });
          }

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('users')
            .insert({ ...query, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
          if (role) {
            await trx('user_groups').insert({
              gid: user.role,
              uid: parseInt(id),
            });
          }
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('users')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(`Failed to update user with ID ${id}: `, err);
    }
  }

  async updateSelf(id, user) {
    const query = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      extension: user.extension,
      isActive: user.isActive,
    };

    try {
      if (user.oldPassword && user.newPassword) {
        const record = await this.findById(id, true);
        if (!comparePass(user.oldPassword, record[0].password)) {
          throw new Error('Authentication failed.');
        }
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(user.newPassword, salt);
        query.password = hash;
      }
    } catch (err) {
      throw new ForbiddenError('Failed to update user: ', err);
    }

    return this.update(id, query);
  }

  async delete(id) {
    return this._db
      .table('users')
      .del()
      .where({ id: parseInt(id) });
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
        phone: 'users.phone',
        extension: 'users.extension',
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
          queryBuilder.where('libraries.id', '=', library);
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
          queryBuilder.limit(end - start + 1);
        }
      });

    return rows || [];
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findById(id, privileged = false) {
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
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.id': parseInt(id) });
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
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.id': parseInt(id) });
    }
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
          phone: 'users.phone',
          extension: 'users.extension',
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
          phone: 'users.phone',
          extension: 'users.extension',
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
      const library = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) })
        .first();

      if (!library) {
        throw new NotFoundError('Invalid library ID.');
      }

      const device = await trx('devices')
        .select()
        .where({ id: parseInt(id) })
        .first();

      if (!device) {
        throw new NotFoundError('Invalid device ID.');
      }

      await trx('library_devices').insert({ lid: lid, did: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_users')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ uid: parseInt(id) });
  }
}
