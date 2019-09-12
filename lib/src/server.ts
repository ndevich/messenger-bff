import * as ws from 'ws';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaCompose from 'koa-compose';
import createLogger from './logger';
import threadController from './threads/controller';
import userController from './users/controller';

const convert = require('koa-convert');
const cors = require('koa-cors');

const koaLogger = require('koa-bunyan-logger');

const logger = createLogger('server');

class Server {
    server: Koa;

    constructor() {
        this.server = new Koa();

        const handleError = async (ctx: Koa.Context, next: Function) => {
            try {
                await next();
            } catch (e) {
                const errorResponse = {
                    message: e.toString(),
                    response_code: 500,
                };

                if (e.status) {
                    errorResponse.response_code = e.status;
                }

                logger.error({ err: e, rsp: errorResponse }, 'Error');
                ctx.body = errorResponse;
                ctx.status = errorResponse.response_code || 500;
            }
        };

        const logRequest = koaLogger.requestLogger({
            updateRequestLogFields: (_reqParams: any) => {
                return {};
            },
            updateResponseLogFields: (resParams: any) => {
                return {
                    size: resParams.res._contentLength,
                    duration: resParams.duration,
                };
            },
        });

        this.server.use(
            KoaCompose([
                handleError,
                koaLogger(logger),
                koaLogger.requestIdContext(),
                koaLogger.timeContext(),
                logRequest,
                convert(
                    cors({
                        origin: 'http://localhost:8080',
                        credentials: true,
                    }),
                ),
                KoaBodyParser(),

                threadController.getRoutes(),
                userController.getRoutes(),
            ]),
        );
    }

    async start() {
        const webSocketServer = new ws.Server({ port: 40405 });
        webSocketServer.on('connection', webSocket => {
            webSocket.on('message', async message => {
                const jsonMessage = JSON.parse(message.toString());
                const messsageWithTime = {
                    ...jsonMessage,
                    time: Date.now(),
                };

                try {
                    await threadController.saveMessageFromWs(messsageWithTime);
                    webSocket.send(JSON.stringify({ success: true }));
                } catch (e) {
                    webSocket.send(
                        JSON.stringify({ success: false, error: e.message }),
                    );
                    return;
                }

                webSocketServer.clients.forEach(c =>
                    c.send(JSON.stringify(messsageWithTime)),
                );
            });
        });

        return new Promise<any>((resolve: any, _reject: any) => {
            this.server.listen(40404, () => {
                logger.info(`Messenger BFF listening at 40404`);
                resolve();
            });
        });
    }
}

const server = new Server();
export default server;
