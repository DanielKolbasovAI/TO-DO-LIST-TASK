const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();
GetUsersByIds = require('./services/user.service');
const mongoose = require('mongoose');

const PROTO_PATH = path.join(__dirname, '../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const { validateToken } = require('./services/auth.service');

async function main() {

    await mongoose.connect(process.env.MONGO_URI, { })
        .then(() => console.log('MongoDB connected for auth-service'))
        .catch(err => console.error("MongoDB connection error:", err));

    const server = new grpc.Server();

    server.addService(authProto.AuthSessionService.service, {
        validateToken,
        ...GetUsersByIds

    });

    const port =  50051;
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log(`Auth gRPC Service running on port ${port}`);
    });
}

main();
