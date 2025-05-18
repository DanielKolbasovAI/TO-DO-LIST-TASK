const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/sync.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const syncProto = grpc.loadPackageDefinition(packageDefinition).sync;

const syncClient = new syncProto.SyncService(
    process.env.SYNC_SERVICE_URL || 'sync-service:50055',
    grpc.credentials.createInsecure()
);

function BroadcastTaskChange({ created = [], updated = [], deleted = [] }) {
    syncClient.BroadcastTaskChange({ created, updated, deleted }, (err) => {
        if (err) {
            console.error('Failed to send sync event:', err.message);
        } else {
            console.log('Sync event sent successfully');
        }
    });
}

module.exports = { BroadcastTaskChange };
