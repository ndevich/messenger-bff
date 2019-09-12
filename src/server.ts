import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaCompose from 'koa-compose';
import createLogger from './logger';
import threadController from './threads/controller';
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
            ]),
        );
    }

    async start() {
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
