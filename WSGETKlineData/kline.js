const log = console.log;
const api = require('binance');
const express = require('express');
const app = express();
const server = app.listen('4000', () => log(`Kline Data Server started on port 4000`));
const socket = require('socket.io');
const io = socket(server);

const bRest = new api.BinanceRest({
    key: "", // Get this from your account on binance.com
    secret: "", // Same for this
    timeout: 15000,
    recvWindow: 20000,
    disableBeautification: false,
    handleDrift: true
});

const binanceWS = new api.BinanceWS(true);
let currentSymbol = 'BTCUSDT'; // Default symbol
let binanceWSInstance = null; // Variable to store the current WebSocket instance

// Function to initialize or update WebSocket subscription
function updateSubscription(symbol) {
    if (binanceWSInstance) {
        binanceWSInstance.removeAllListeners(); // Clear all listeners from the existing instance
        binanceWSInstance.close(); // Close the existing WebSocket connection
    }

    binanceWSInstance = binanceWS.onKline(symbol, '1m', async (data) => {
        // Convert the timestamp to UTC+7
        const startTimeUTC = new Date(data.kline.startTime);
        const startTimeUTC7 = new Date(startTimeUTC.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours

        // Convert prices from USDT to THB
        const open = parseFloat(data.kline.open);
        const high = parseFloat(data.kline.high);
        const low = parseFloat(data.kline.low);
        const close = parseFloat(data.kline.close);

        io.sockets.emit('KLINE', {
            time: Math.round(startTimeUTC7.getTime() / 1000), // Use the adjusted time
            open: open,
            high: high,
            low: low,
            close: close
        });
    });
}

// Initialize with default subscription
updateSubscription(currentSymbol);

// Listen for changes in symbol from the client
io.on('connection', (socket) => {
    socket.on('CHANGE_SYMBOL', (symbol) => {
        log(`Changing subscription to ${symbol}`);
        currentSymbol = symbol;
        updateSubscription(symbol);
    });
});
