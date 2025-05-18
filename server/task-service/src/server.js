const fs = require('fs');
const https = require('https');
const app = require('./app');
const logger = require('./utils/loggerClient');
const log = logger();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

if (ENV === 'production') {
    const sslOptions = {
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem')
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
        log.info(`Task-service running securely in PRODUCTION at https://yourdomain.com:${PORT}`);
    });
} else if (ENV === 'development'){
    const keyPath = './localhost-key.pem';
    const certPath = './localhost-cert.pem';

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const sslOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };

        https.createServer(sslOptions, app).listen(PORT, () => {
            log.info(`Task-service running securely in DEV at https://localhost:${PORT}`);
        });
    } else {
        app.listen(PORT, () => {
            log.info(`Task-service running in DEV (no SSL) at http://localhost:${PORT}`);
        });
    }
}
else {
    throw new Error(`Invalid NODE_ENV value: ${ENV}`);
}
