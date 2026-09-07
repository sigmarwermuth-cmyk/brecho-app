import knex from 'knex';
import config from './index';

const db = knex(config.database);

export default db;
