const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { systemLog } = require('./services/logger.service');

const {
    handleLog,
    handleChangeLogLevel,
    handleChangePackageLogLevel
} = require('./services/logger.service');
require('dotenv').config();

const PROTO_PATH = path.join(__dirname, '../proto/logger.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true
});
const loggerProto = grpc.loadPackageDefinition(packageDefinition).logger;

function main() {
    const server = new grpc.Server();

    server.addService(loggerProto.LoggerService.service, {
        Log: handleLog,
        ChangeLogLevel: handleChangeLogLevel,
        ChangePackageLogLevel: handleChangePackageLogLevel
    });

    const port = 50054;
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        systemLog(`Logger Service running on port ${port}`);
    });
}

main();
