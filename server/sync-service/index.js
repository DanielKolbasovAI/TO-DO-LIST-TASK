const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const WebSocket = require('ws'); // For real-time WS broadcasting
const path = require('path');

const PROTO_PATH = path.join(__dirname, './proto/sync.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).sync;

const PORT = process.env.port || 50055;
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

wss.on('connection', ws => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

function broadcastToClients(message) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

function BroadcastTaskChange(call, callback) {
    const event = call.request;
    broadcastToClients(JSON.stringify(event));
    callback(null, {}); // return Empty
}

const server = new grpc.Server();
server.addService(proto.SyncService.service, { BroadcastTaskChange });

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`sync-service running on gRPC port ${PORT} and WebSocket on 8080`);
    server.start();
});
