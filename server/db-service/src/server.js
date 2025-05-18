const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const path = require('path');
const dbHandlers = require('./services/db.service');
require('dotenv').config();

const PROTO_PATH = path.join(__dirname, '../proto/dataBase.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const dbProto = grpc.loadPackageDefinition(packageDefinition).db;

const server = new grpc.Server();
server.addService(dbProto.DbService.service, dbHandlers);

const PORT = process.env.PORT || 50053;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/tasks?replicaSet=rs0';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) {
                console.error('Failed to bind gRPC server:', err);
                process.exit(1);
            }
            console.log(`db-service gRPC server running on port ${PORT}`);
            server.start();
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
