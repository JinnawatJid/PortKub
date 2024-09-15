// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create the main app
const app = express();
app.use(cors());

// Serve static files from the 'app/trading' directory
app.use(express.static(path.join(__dirname, '..', 'app', 'trading')));

// Redirect root URL to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'app', 'trading', 'index.html'));
});

// Start your main app server
const port = 3000;
app.listen(port, () => {
    console.log(`Main server is running on port ${port}`);
});

// Automatically run the REST API Proxy (restproxy.js)
require('../RESTGETAPIProxy/restproxy');

// Automatically run the Kline WebSocket data server (kline.js)
require('../WSGETKlineData/kline');
