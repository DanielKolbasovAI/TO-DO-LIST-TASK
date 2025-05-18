const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();

mongoose.connect(process.env.MONGO_URI, { })
    .then(() => console.log("Connected to MongoDB (auth-service)"))
    .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`auth-service REST API running on port ${port}`);
});
