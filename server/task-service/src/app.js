const express = require('express');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

module.exports = app;
