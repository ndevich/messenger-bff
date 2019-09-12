import threadRepo, { Message, Thread } from '../threads/repo';
import createLogger from '../logger';

const logger = createLogger('user-model');

class UserModel {
    constructor(private mThreadRepo = threadRepo) {}

    async getUserThreads(userId: string): Promise<Thread[]> {
        if (!userId) {
            logger.error('Getting user threads requires user id');
            return null;
        }
        return this.mThreadRepo.getThreadsByUser(userId);
    }
}

const user = new UserModel();
export default user;
