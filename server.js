'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the Blackjack game!');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Example of handling a game event
    socket.on('startGame', () => {
        // Game logic to start the game goes here
        io.emit('gameStarted', { message: 'Game has started!' });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
