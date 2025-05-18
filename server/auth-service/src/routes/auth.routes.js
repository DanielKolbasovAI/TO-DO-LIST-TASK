const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { username, email, firstName, lastName, password } = req.body;
        const result = await userService.registerUser({ username, email, firstName, lastName, password });
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await userService.loginUser(username, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/check-username', async (req, res) => {
    try {
        const exists = await userService.checkUsernameExists(req.query.username);
        res.json({ exists });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/logout', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        userService.logoutUser(userId);
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to logout.' });
    }
});

module.exports = router;
