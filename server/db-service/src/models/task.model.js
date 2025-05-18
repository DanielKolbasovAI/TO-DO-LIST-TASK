const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    lockedBy: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('TaskItem', TaskSchema);
