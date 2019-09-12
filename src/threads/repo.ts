import db from '../postgres';
import createLogger from '../logger';

const logger = createLogger('thread-repo');

export interface Message {
    username: string;
    message: string;
    time: Date;
}

export interface Thread {
    id: string;
    users: string[];
    messages: Message[];
}

class ThreadRepository {
    private tableName = 'threads';

    constructor() {
        this.createTable();
    }

    private async createTable() {
        db.query(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id SERIAL,
                users TEXT [] NOT NULL,
                messages TEXT []
            )
        `);
    }

    async createThread(users: string[]): Promise<Thread> {
        let result: any;

        let sqlFriendlyStr = '[';
        users.forEach(
            (u, i) =>
                (sqlFriendlyStr +=
                    `'${u.trim()}'` + (i !== users.length - 1 ? ',' : '')),
        );
        sqlFriendlyStr += ']';

        try {
            result = await db.query(`
                INSERT INTO ${this.tableName} (users, messages)
                VALUES (
                    ARRAY ${sqlFriendlyStr},
                    ARRAY[]::TEXT[]
                )
                RETURNING id;
            `);
        } catch (e) {
            logger.error(e, 'Create unsuccessful');
            return null;
        }

        return result.rows && result.rows[0] && result.rows[0]
            ? result.rows[0]
            : null;
    }

    async getThreadById(id: string): Promise<Thread> {
        let result: any;
        try {
            result = await db.query(`
                SELECT * FROM ${this.tableName}
                WHERE id = ${id}
            `);
        } catch (e) {
            logger.error(e, `Select unsuccessful for id ${id}`);
            return null;
        }

        return result.rows && result.rows[0] && result.rows[0]
            ? result.rows[0]
            : null;
    }

    async addMessage(id: string, entry: Message): Promise<Thread> {
        let result: any;

        try {
            result = await db.query(`
                UPDATE ${this.tableName}
                SET messages = array_append(messages, '${JSON.stringify(
                    entry,
                )}')
                WHERE id = ${id}
                RETURNING id, users, messages
            `);
        } catch (e) {
            logger.error(e, `Update unsuccessful for id ${id}`);
            return null;
        }

        return result.rows && result.rows[0] && result.rows[0]
            ? result.rows[0]
            : null;
    }
}

const threadRepo = new ThreadRepository();
export default threadRepo;
