const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthSessionService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

module.exports = client;
