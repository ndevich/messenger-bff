'use strict';

import createLogger from './logger';
import server from './server';

const logger = createLogger('messenger-bff');

async function start() {
    'use strict';
    try {
        await server.start();
    } catch (err) {
        logger.fatal({ err, msg: 'Error on start up' });
        process.exit(1);
    }
}

if (require.main === module) {
    start();
}
