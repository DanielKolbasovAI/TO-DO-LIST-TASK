const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    lastActivity: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);
