import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:network');

export default class NetworkManager {
  constructor(db) {
    this._db = db;
  }

  async create(network, lid) {
    network = network.map(n => ({
      ...n,
      ips: JSON.stringify(n.ips),
    }));
    try {
      let networks;
      await this._db.transaction(async trx => {
        let library;
        if (lid) {
          library = await trx('libraries')
            .select()
            .where({ id: parseInt(lid) })
            .first();
          if (!library) {
            throw new BadRequestError('Invalid library ID.');
          }
        }
        networks = await trx('networks')
          .insert(network)
          .returning('id', 'created_at', 'updated_at');

        if (Number.isInteger(networks[0])) {
          networks = await trx('networks')
            .select('id', 'created_at', 'updated_at')
            .whereIn('id', networks);
        }

        if (library) {
          const inserts = networks.map(n => ({
            lid: library.id,
            nid: n.id,
          }));
          await trx('library_networks').insert(inserts);
        }
      });
      return networks;
    } catch (err) {
      throw new BadRequestError('Failed to create network: ', err);
    }
  }

  async update(id, network) {
    network.ips = JSON.stringify(network.ips);
    try {
      let existing, updated;
      let exists = false;
      await this._db.transaction(async trx => {
        existing = await trx('networks')
          .select('*')
          .where({ id: parseInt(id) })
          .first();

        if (existing) {
          log.debug('Entry exists, deleting old version.');
          await trx('networks')
            .del()
            .where({ id: parseInt(id) });
          log.debug('Entry exists, inserting new version.');
          [updated] = await trx('networks')
            .insert({ ...network, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');

          exists = true;
        } else {
          log.debug('Entry does not already exist, inserting.');
          [updated] = await trx('networks')
            .insert({ ...network, id: parseInt(id) })
            .returning('id', 'created_at', 'updated_at');
        }
        // workaround for sqlite
        if (Number.isInteger(updated)) {
          updated = await trx('networks')
            .select('id', 'created_at', 'updated_at')
            .where({ id: parseInt(id) })
            .first();
        }
      });
      return { ...updated, exists: exists };
    } catch (err) {
      throw new BadRequestError(
        `Failed to update network with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('networks')
      .del()
      .where({ id: parseInt(id) });
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'networks.id',
    from: from,
    to: to,
    library: library,
  }) {
    const rows = await this._db
      .table('networks')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_networks', {
            'networks.id': 'library_networks.nid',
            'library_networks.lid': this._db.raw('?', [library]),
          });
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

    return rows.map(r => {
      if (r.ips) {
        let ips = JSON.parse(r.ips);
        delete r.ips;
        return { ...r, ips: ips };
      } else {
        return r;
      }
    });
  }

  async findById(id, library) {
    const network = await this._db
      .table('networks')
      .select('*')
      .where({ id: parseInt(id) })
      .modify(queryBuilder => {
        if (library) {
          log.debug('Filtering on library: ', library);
          queryBuilder.join('library_networks', {
            'networks.id': 'library_networks.nid',
            'library_networks.lid': this._db.raw('?', [library]),
          });
        }
      })
      .first();
    if (network && network.ips) {
      return { ...network, ips: JSON.parse(network.ips) };
    } else {
      return network;
    }
  }

  async findAll() {
    return this._db.table('networks').select('*');
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

      const network = await trx('networks')
        .select()
        .where({ id: parseInt(id) })
        .first();

      if (!network) {
        throw new NotFoundError('Invalid network ID.');
      }

      await trx('library_networks').insert({ lid: lid, nid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_networks')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ nid: parseInt(id) })
      .returning('*');
  }
}
