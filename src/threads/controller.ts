import BaseRouter from '../router';
import threadModel from './model';

class ThreadController extends BaseRouter {
    constructor() {
        super('/thread');
    }

    mapRoutes() {
        this.router.post('create', '/', async (ctx, next) => {
            if (ctx.request.body && ctx.request.body.users) {
                const id = await threadModel.create(ctx.request.body.users);
                if (id) {
                    ctx.response.body = {
                        threadId: id,
                    };
                } else {
                    ctx.status = 500;
                }
            } else {
                ctx.response.body = {
                    error:
                        '400 - Creating a thread requires body { users: string[] }',
                };
                ctx.response.status = 400;
            }

            next();
        });

        this.router.post('send', '/:threadId/:username', async (ctx, next) => {
            const { username, threadId } = ctx.params;

            if (ctx.request.body && ctx.request.body.message) {
                const { message } = ctx.request.body;

                try {
                    const send = await threadModel.send(
                        threadId,
                        username,
                        message,
                    );
                    ctx.response.status = send ? 204 : 500;
                } catch (e) {
                    ctx.response.body = { error: e.message };
                    ctx.response.status = 500;
                }
            } else {
                ctx.response.body = {
                    error:
                        '400 - Sending a message requires body { message: string }',
                };
                ctx.response.status = 400;
            }

            next();
        });

        this.router.get('get', '/:threadId', async (ctx, next) => {
            const messages = await threadModel.getMessages(ctx.params.threadId);
            if (messages) {
                ctx.response.body = {
                    messages,
                };
            } else {
                ctx.status = 404;
            }

            next();
        });
    }
}

const threadController = new ThreadController();
export default threadController;
