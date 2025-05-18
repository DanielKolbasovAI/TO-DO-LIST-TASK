const express = require('express');
const router = express.Router();
const grpc = require('@grpc/grpc-js');

const auth = require('../middleware/authMiddleware');
const taskService = require('../services/task.service');

function mapGrpcErrorToHttp(err, res) {
    if (err.code === grpc.status.PERMISSION_DENIED)
        return res.status(403).json({ error: err.message });
    if (err.code === grpc.status.NOT_FOUND)
        return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
}

router.post('/unlockAllTasksByIds', auth, async (req, res) => {
    try {
        await taskService.unlockAllTasks(req.body, req.user.userId);
        res.status(200).send();
    }
    catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50, includeUsers = "false", all = "false" } = req.query;

        let tasks;
        if (all === "true") {
            tasks = await taskService.getAllTasks();
        } else {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            tasks = await taskService.getTasksPaginated(skip, parseInt(limit));
        }

        let users = [];
        if (includeUsers === "true") {
            const lockedByUserIds = [...new Set(tasks.map(t => t.lockedBy).filter(Boolean))];

            if (lockedByUserIds.length > 0) {
                users = await taskService.getUsersThatLockedTasksByUsersIds(lockedByUserIds);
            }
        }

        res.json({
            tasks,
            users
        });

    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});


router.get('/:id', auth, async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.json(task);
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const task = await taskService.createTask(req.body);
        res.status(201).json(task);
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updated = await taskService.updateTask(
            req.params.id,
            { ...req.body, userId: req.user.userId }
        );
        res.json(updated);
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await taskService.deleteTask(
            req.params.id,
            req.user.userId
        );
        res.status(204).send();
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.post('/:id/lock', auth, async (req, res) => {
    try {
        const task = await taskService.lockTask(
            req.params.id,
            req.user.userId
        );
        res.json(task);
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.post('/:id/unlock', auth, async (req, res) => {
    try {
        const task = await taskService.unlockTask(
            req.params.id,
            req.user.userId
        );
        res.json(task);
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

router.post('/saveAll', auth, async (req, res) => {
    try {
        const { toCreate = [], toUpdate = [], toDelete = [] } = req.body;

        // Call the taskService wrapper that sends a single gRPC request
        const { updatedTasks } = await taskService.saveAllTasks({
            toCreate,
            toUpdate,
            toDelete
        });

        res.json({ updatedTasks });
    } catch (err) {
        mapGrpcErrorToHttp(err, res);
    }
});

module.exports = router;
