// All the routes will be prefixed with `/erp`.

const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

module.exports = app;
