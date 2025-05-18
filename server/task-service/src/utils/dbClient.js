const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/dataBase.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const dbProto = grpc.loadPackageDefinition(packageDefinition).db;

const client = new dbProto.DbService(
    process.env.DB_SERVICE_URL || 'db-service:50052',
    grpc.credentials.createInsecure()
);

module.exports = client;
