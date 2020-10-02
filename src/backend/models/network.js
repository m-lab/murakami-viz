import knex from 'knex';
import { validate } from '../../common/schemas/network.js';
import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:network');

export default class NetworkManager {
  constructor(db) {
    this._db = db;
  }

  async create(network, lid) {
    try {
      await validate(network);
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
        ids = await trx('networks')
          .returning('id')
          .insert(network);

        if (!Array.isArray(ids)) {
          ids = [ids];
        }

        if (lids.length > 0) {
          const inserts = ids.map(id => ({ lid: lid[0], nid: id }));

          await trx('library_networks').insert(inserts);
        }
      });
      return ids;
    } catch (err) {
      throw new BadRequestError('Failed to create network: ', err);
    }
  }

  async update(id, network) {
    try {
      await validate(network);
    } catch (err) {
      throw new BadRequestError('Failed to update network: ', err);
    }
    return this._db
      .table('networks')
      .where({ id: parseInt(id) })
      .update(
        {
          name: network.name,
          isp: network.isp,
          ips: JSON.stringify(network.ips),
          contracted_speed_upload: network.contracted_speed_upload,
          contracted_speed_download: network.contracted_speed_download,
          bandwidth_cap_upload: network.bandwidth_cap_upload,
          bandwidth_cap_download: network.bandwidth_cap_download,
          updated_at: network.updated_at,
        },
        [
          'id',
          'name',
          'isp',
          'ips',
          'contracted_speed_upload',
          'contracted_speed_download',
          'bandwidth_cap_upload',
          'bandwidth_cap_download',
          'updated_at',
        ],
      );
  }

  async delete(id) {
    try {
      let ids;
      await this._db.transaction(async trx => {
        ids = await trx('networks')
          .del()
          .where({ id: parseInt(id) });
        await trx('library_networks')
          .del()
          .where({ nid: parseInt(id) });
      });
      return ids;
    } catch (err) {
      throw new BadRequestError(
        `Failed to delete network with ID ${id}: `,
        err,
      );
    }
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
            'library_networks.lid': knex.raw('?', [library]),
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
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('networks')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('networks').select('*');
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
      ids = await trx('networks')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid network ID.');
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
