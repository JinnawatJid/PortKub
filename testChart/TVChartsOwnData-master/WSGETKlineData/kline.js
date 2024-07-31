const log = console.log;
const api = require('binance');
const express = require('express');
const app = express();
const server = app.listen('4000',() => log(`Kline Data Server started on port 4000`));
const socket = require('socket.io');
const io = socket(server);

const bRest = new api.BinanceRest({
        key: "", // Get this from your account on binance.com
        secret: "", // Same for this
        timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
        recvWindow: 20000, // Optional, defaults to 5000, increase if you're getting timestamp errors
        disableBeautification: false,
        handleDrift: true
});
const binanceWS = new api.BinanceWS(true);

// Convert prices to THB and emit to clients
const bws = binanceWS.onKline('BTCUSDT', '1m', async (data) => {

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
