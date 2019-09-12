import threadRepo, { Message, Thread } from './repo';
import createLogger from '../logger';

const logger = createLogger('thread-model');

class ThreadModel {
    constructor(private mThreadRepo = threadRepo) {}

    async create(users: string[]): Promise<string> {
        if (!users || users.length === 0) {
            logger.error('Creating thread requires user input');
            return null;
        }

        const createdThread = await this.mThreadRepo.createThread(users);
        return createdThread ? createdThread.id : null;
    }

    async send(
        threadId: string,
        username: string,
        message: string,
        time?: Date,
    ): Promise<boolean> {
        if (!threadId || !username || !message) {
            logger.error(
                'Sending message requires thread id, username, and message',
            );
            throw new Error(`Incorrect message send format`);
        }

        const thread = await this.get(threadId);
        if (thread && thread.users.includes(username)) {
            const success = !!(await this.mThreadRepo.addMessage(threadId, {
                username,
                message,
                time: time || new Date(),
            }));

            if (success) {
                return true;
            } else {
                throw new Error(
                    `Message not sent - db update unsuccessful - thread ${threadId}`,
                );
            }
        } else {
            throw new Error(
                `Message not sent - user ${username} not part of thread ${threadId}!`,
            );
        }
    }

    async get(threadId: string): Promise<Thread> {
        if (!threadId) {
            logger.error('Getting thread requires thread id');
            return null;
        }

        return this.mThreadRepo.getThreadById(threadId);
    }

    async getMessages(threadId: string): Promise<Message[]> {
        if (!threadId) {
            logger.error('Getting thread requires thread id');
            return null;
        }

        const thread = await this.mThreadRepo.getThreadById(threadId);
        return thread ? thread.messages : null;
    }
}

const thread = new ThreadModel();
export default thread;
