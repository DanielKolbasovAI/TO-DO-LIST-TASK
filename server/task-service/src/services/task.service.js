const dbClient = require('../utils/dbClient');
const authClient = require('../utils/authClient');
const syncClient = require('../utils/syncClient');

exports.getAllTasks = () => new Promise((resolve, reject) => {
    const tasks = [];
    const call = dbClient.GetAllTasks({});
    call.on('data', (task) => tasks.push(task));
    call.on('end', () => resolve(tasks));
    call.on('error', reject);
});

exports.getUsersThatLockedTasksByUsersIds = (usersIds) => new Promise((resolve, reject) => {
    const users = [];
    const call = authClient.GetUsersByIds({ usersIds });
    call.on('data', (user) => users.push(user));
    call.on('end', () => resolve(users));
    call.on('error', reject);
});

exports.getTasksPaginated = (skip, limit) => new Promise((resolve, reject) => {
    const tasks = [];
    const page = Math.floor(skip / limit) + 1;
    const call = dbClient.GetTasksPaged({ page, limit });
    call.on('data', (task) => tasks.push(task));
    call.on('end', () => resolve(tasks));
    call.on('error', reject);
});

exports.getTaskById = (id) => new Promise((resolve, reject) => {
    dbClient.GetTaskById({ id }, (err, res) => err ? reject(err) : resolve(res));
});

exports.createTask = (data) => new Promise((resolve, reject) => {
    dbClient.CreateTask(data, (err, res) => {
        if (err) return reject(err);
        syncClient.BroadcastTaskChange({
            created: [res],
            updated: [],
            deleted: []
        }, () => {});
        resolve(res);
    });
});

exports.updateTask = (id, data) => new Promise((resolve, reject) => {
    dbClient.UpdateTask({ id, ...data }, (err, res) => {
        if (err) return reject(err);
        syncClient.BroadcastTaskChange({
            created: [],
            updated: [res],
            deleted: []
        }, () => {});
        resolve(res);
    });
});

exports.deleteTask = (id, userId) => new Promise((resolve, reject) => {
    dbClient.DeleteTask({ id, userId }, (err) => {
        if (err) return reject(err);
        syncClient.BroadcastTaskChange({
            created: [],
            updated: [],
            deleted: [id]
        }, () => {});
        resolve();
    });
});

exports.lockTask = (id, userId) => new Promise((resolve, reject) => {
    dbClient.LockTask({ id, userId }, (err, res) => {
        if (err) return reject(err);
        syncClient.BroadcastTaskChange({
            created: [],
            updated: [res],
            deleted: []
        }, () => {});
        resolve(res);
    });
});

exports.unlockAllTasks = (ids, userId) => new Promise(async (resolve, reject) => {
    try {
        const unlockedTasks = [];

        for (const id of taskIds) {
            const res = await new Promise((res, rej) => {
                dbClient.UnlockTask({id, userId}, (err, task) => {
                    if (err) return rej(err);
                    res(task);
                });
            });

            unlockedTasks.push(res);

            // Inform other clients
            syncClient.BroadcastTaskChange({
                created: [],
                updated: [res],
                deleted: []
            }, () => {
            });
        }

        resolve(unlockedTasks);
    } catch (err) {
        reject(err);
    }
});
exports.unlockTask = (id, userId) => new Promise((resolve, reject) => {
    dbClient.UnlockTask({ id, userId }, (err, res) => {
        if (err) return reject(err);
        syncClient.BroadcastTaskChange({
            created: [],
            updated: [res],
            deleted: []
        }, () => {});
        resolve(res);
    });
});

exports.saveAllTasks = ({ toCreate, toUpdate, toDelete }) => new Promise((resolve, reject) => {
    dbClient.SaveAllTasks({ toCreate, toUpdate, toDelete }, (err, res) => {
        if (err) return reject(err);
        const { updatedTasks } = res;
        const created = updatedTasks.filter(t => toCreate.some(tc => tc.title === t.title && tc.description === t.description));
        const updated = updatedTasks.filter(t => !created.find(c => c.id === t.id));
        syncClient.BroadcastTaskChange({
            created,
            updated,
            deleted: toDelete
        }, () => {});
        resolve(res);
    });
});
