const {logger} = require('./src/logger');
const app = require('./src/app');

const port = process.env.BUMPER_PORT || 3001;

app.listen(port, () => {
    logger.info('Listening port %s', port);
});
