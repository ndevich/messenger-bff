import { Pool, PoolConfig } from 'pg';
import createLogger from './logger';

const logger = createLogger('postgres');

class PostgresDB {
    private config: PoolConfig;
    private pool: Pool;

    constructor(config?: PoolConfig) {
        this.config = config;
        this.connect();
    }

    private connect() {
        try {
            this.pool = new Pool(this.config);
        } catch (e) {
            logger.error(
                e,
                `Error creating new pool with config ${this.config}`,
            );
        }
    }

    async query(text: string, params?: any[], callback?: any) {
        try {
            return this.pool.query(text, params, callback);
        } catch (e) {
            logger.error(
                e,
                `Error attempting query ${text} with params ${params}`,
            );
            return null;
        }
    }
}

const db = new PostgresDB({
    host: 'localhost',
    port: 5432,
    database: 'nadinedevich',
});
export default db;
