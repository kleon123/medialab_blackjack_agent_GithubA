const socket = io();
let gameState = { gameId: null, playerHand: [], dealerHand: [], playerValue: 0, dealerValue: 0 };

function startGame() {
    socket.emit('gameStart', { gameId: `game_${Date.now()}` });
}

function playerHit() {
    socket.emit('playerAction', { gameId: gameState.gameId, action: 'hit' });
}

function playerStand() {
    socket.emit('playerAction', { gameId: gameState.gameId, action: 'stand' });
}

socket.on('gameStarted', (data) => {
    gameState.gameId = data.gameId;
    console.log('Game started:', data);
});

socket.on('gameEnded', (data) => {
    console.log('Game ended:', data);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});
