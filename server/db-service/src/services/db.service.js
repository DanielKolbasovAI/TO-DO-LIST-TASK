const TaskItem = require('../models/task.model');
const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');

exports.createTask = async (call, callback) => {
    try {
        const { title, description } = call.request;
        const task = await TaskItem.create({ title, description });
        callback(null, mapToProto(task));
    } catch (err) {
        callback(err);
    }
};

exports.getTaskById = async (call, callback) => {
    try {
        const task = await TaskItem.findById(call.request.id);
        if (!task) return callback(null, {});
        callback(null, mapToProto(task));
    } catch (err) {
        callback(err);
    }
};

exports.getTasksPaged = async (call) => {
    try {
        const { page, limit } = call.request;

        const validation = validatePagination(page, limit);
        if (!validation.valid) {
            return call.destroy({
                code: grpc.status.INVALID_ARGUMENT,
                message: validation.message
            });
        }

        const tasks = await TaskItem.find().skip(validation.skip).limit(validation.limit);
        tasks.forEach(task => call.write(mapToProto(task)));
        call.end();

    } catch (err) {
        console.error('Error in getTasksPaged:', err);
        call.destroy({
            code: grpc.status.INTERNAL,
            message: 'Failed to fetch paginated tasks.'
        });
    }
};

exports.getAllTasks = async (call) => {
    const tasks = await TaskItem.find();
    tasks.forEach(task => call.write(mapToProto(task)));
    call.end();
};

exports.UpdateTask = async (call, callback) => {
    const { id, ...updateData } = call.request;

    try {
        const task = await TaskItem.findById(id);
        if (!task) return callback({ code: grpc.status.NOT_FOUND, message: 'Task not found' });

        if (task.lockedBy && task.lockedBy !== updateData.userId) {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: 'Task is locked by another user'
            });
        }

        Object.assign(task, updateData);
        const saved = await task.save();
        const savedTask = saved.toObject();
        savedTask.id = savedTask._id.toString();
        delete savedTask._id;

        callback(null, savedTask);

    } catch (err) {
        callback(err);
    }
};


exports.deleteTask = async (call, callback) => {
    try {
        const { id, userId } = call.request;
        const task = await TaskItem.findById(id);
        if (!task) return callback({
            code: grpc.status.NOT_FOUND,
            message: 'Task not found'
        });

        if (task.lockedBy && task.lockedBy !== userId) {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: 'Task is locked by another user'
            });
        }

        await TaskItem.findByIdAndDelete(id);
        callback(null, {});

    } catch (err) {
        callback(err);
    }
};


exports.lockTask = async (call, callback) => {
    try {
        const { id, userId } = call.request;
        const task = await TaskItem.findById(id);
        if (!task) return callback({
            code: grpc.status.NOT_FOUND,
            message: 'Task not found'
        });

        if (task.lockedBy && task.lockedBy !== userId) {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: 'Task is already locked by another user'
            });
        }

        task.lockedBy = userId;
        await task.save();

        callback(null, mapToProto(task));

    } catch (err) {
        callback(err);
    }
};



exports.SaveAllTasks = async (call, callback) => {
    const { toCreate = [], toUpdate = [], toDelete = [] } = call.request;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const createdDocs = await insertTasks(toCreate, session);
        const createdIds = createdDocs.map(doc => doc._id.toString());

        const bulkOps = buildBulkOps(toUpdate, toDelete);
        if (bulkOps.length > 0) {
            await TaskItem.bulkWrite(bulkOps, { session });
        }

        await session.commitTransaction();
        session.endSession();

        const updatedTasks = await fetchAffectedTasks(createdIds, toUpdate, toDelete);
        const unlockedTasks = [];
        for (const task of updatedTasks) {
            task.lockedBy = null;
            task.markModified('lockedBy');
            await task.save(); // unlock in DB
            unlockedTasks.push(task);
        }
        callback(null, { updatedTasks: [...createdDocs, ...unlockedTasks] });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("SaveAllTasks failed:", err);
        callback(err);
    }
};


exports.unlockTask = async (call, callback) => {
    try {
        const { id, userId } = call.request;
        const task = await TaskItem.findById(id);
        if (!task) return callback({
            code: grpc.status.NOT_FOUND,
            message: 'Task not found'
        });

        if (!task.lockedBy || task.lockedBy !== userId) {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: 'You do not own the lock'
            });
        }

        task.lockedBy = null;
        await task.save();

        callback(null, mapToProto(task));

    } catch (err) {
        callback(err);
    }
};



function mapToProto(task) {
    if (!task) return {};
    return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        lockedBy: task.lockedBy ?? ''
    };
}

function validatePagination(page, limit) {
    const MAX_LIMIT = 1000;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > MAX_LIMIT) {
        return {
            valid: false,
            message: `Invalid pagination parameters. Page must be >= 1, limit must be 1-${MAX_LIMIT}.`
        };
    }

    return {
        valid: true,
        skip: (pageNum - 1) * limitNum,
        limit: limitNum
    };
}

async function insertTasks(toCreate, session) {
    if (toCreate.length === 0) return [];

    return await TaskItem.insertMany(
        toCreate.map(task => ({
            title: task.title,
            description: task.description,
            completed: false,
            lockedBy: null
        })),
        { session }
    );
}

function buildBulkOps(toUpdate = [], toDelete = []) {
    return [
        ...toUpdate.map(task => ({
            updateOne: {
                filter: { _id: task.id },
                update: {
                    $set: {
                        title: task.title,
                        description: task.description,
                        completed: task.completed,
                        lockedBy: task.lockedBy
                    }
                }
            }
        })),
        ...toDelete.map(id => ({
            deleteOne: {
                filter: { _id: id }
            }
        }))
    ];
}

async function fetchAffectedTasks(createdIds, toUpdate, toDelete) {
    const updatedIds = toUpdate.map(t => t.id);
    const allIds = [...createdIds, ...updatedIds].filter(id => !toDelete.includes(id));
    return await TaskItem.find({ _id: { $in: allIds } });
}
