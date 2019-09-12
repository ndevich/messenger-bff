import BaseRouter from '../router';
import userModel from './model';

class UserController extends BaseRouter {
    constructor() {
        super('/users');
    }

    mapRoutes() {
        this.router.get('get', '/:userId/threads', async (ctx, next) => {
            const threads = await userModel.getUserThreads(ctx.params.userId);
            if (threads) {
                ctx.response.body = {
                    threadIds: threads.map(t => t.id),
                };
            } else {
                ctx.status = 404;
            }

            next();
        });
    }
}

const userController = new UserController();
export default userController;
