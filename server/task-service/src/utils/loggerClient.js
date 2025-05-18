const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/logger.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true
});
const loggerProto = grpc.loadPackageDefinition(packageDefinition).logger;
const dns = process.env.LOGGER_SERVICE_URL
const client = new loggerProto.LoggerService(
    'localhost:50054',
    grpc.credentials.createInsecure()
);

function createLogger(serviceName) {
    const pkgName = serviceName || process.env.SERVICE_NAME || 'task-service';

    function send(level, message) {
        client.Log({
            serviceName: pkgName,
            message,
            level,
            timestamp: new Date().toISOString()
        }, (err) => {
            if (err) console.error(`[${pkgName}] Logger gRPC error:`, err.message);
        });
    }

    return {
        debug: (msg) => send(0, msg),  // DEBUG
        info:  (msg) => send(1, msg),  // INFO
        warn:  (msg) => send(2, msg),  // WARN
        error: (msg) => send(3, msg),  // ERROR
        fatal: (msg) => send(4, msg)   // FATAL
    };
}

module.exports = createLogger;
