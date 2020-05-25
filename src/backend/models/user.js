import bcrypt from 'bcryptjs';
import { validate } from '../../common/schemas/user.js';
import { UnprocessableError } from '../../common/errors.js';

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class User {
  constructor(db) {
    this._db = db;
  }

  async create(user) {
    try {
      await validate(user);
    } catch (err) {
      throw new UnprocessableError('Failed to create user: ', err);
    }
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
    return this._db
      .table('users')
      .insert(user)
      .returning('*');
  }

  async update(id, user) {
    try {
      await validate(user);
    } catch (err) {
      throw new UnprocessableError('Failed to update user: ', err);
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
          location: user.location,
          role: user.role,
        },
        [
          'id',
          'firstName',
          'lastName',
          'username',
          'email',
          'password',
          'location',
          'role',
        ],
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
    sort_by: sort_by = 'id',
    from: from,
    to: to,
  }) {
    const rows = await this._db
      .table('users')
      .column(
        'id',
        'username',
        'firstName',
        'lastName',
        'location',
        'role',
        'email',
        'isActive',
      )
      .select()
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
      .table('users')
      .column(
        'id',
        'username',
        'firstName',
        'lastName',
        'location',
        'role',
        'email',
        'isActive',
      )
      .select()
      .where({ id: parseInt(id) });
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findByUsername(username, privileged = false) {
    if (privileged) {
      return this._db
        .table('users')
        .select('*')
        .where({ username: username })
        .first();
    } else {
      return this._db
        .table('users')
        .column(
          'id',
          'username',
          'firstName',
          'lastName',
          'location',
          'role',
          'email',
          'isActive',
        )
        .select()
        .where({ username: username })
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
}
