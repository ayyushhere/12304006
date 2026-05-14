const express = require('express');
const { Log } = require('../logging_middleware');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Backend Server is running');
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    Log("backend", "info", "config", "Backend server initialized successfully");
});