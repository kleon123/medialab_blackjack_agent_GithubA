// handlers/game-handler.js

const { BlackjackGame } = require('../game/blackjack-engine');
const { RandomStrategy, AggressiveStrategy, ConservativeStrategy } = require('../agents/base-agent');

const games = new Map();

class GameHandler {
    static initializeAgents() {
        return {
            'Agent_Random': new RandomStrategy('Agent_Random'),
            'Agent_Aggressive': new AggressiveStrategy('Agent_Aggressive'),
            'Agent_Conservative': new ConservativeStrategy('Agent_Conservative')
        };
    }

    static handleGameStart(io, socket, data) {
        try {
            const agents = GameHandler.initializeAgents();
            const gameId = data.gameId || `game_${Date.now()}`;
            const game = new BlackjackGame();
            
            games.set(gameId, {
                game,
                gameId,
                agents: agents,
                status: 'active',
                results: {}
            });

            io.emit('gameStarted', {
                gameId,
                message: 'Game started!',
                players: Object.keys(agents)
            });

            socket.emit('gameReady', {
                gameId,
                playerHand: game.playerHand.cards,
                dealerHand: [game.dealerHand.cards[0]],
                playerValue: game.playerHand.evaluate(),
                dealerValue: game.dealerHand.cards[0].value
            });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    static handlePlayerAction(io, socket, data) {
        try {
            const { gameId, action } = data;
            const gameState = games.get(gameId);

            if (!gameState) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            const { game } = gameState;

            if (action === 'hit') {
                game.playerHit();
                io.emit('playerHit', {
                    gameId,
                    handValue: game.playerHand.evaluate(),
                    cards: game.playerHand.cards
                });

                if (game.playerHand.evaluate() > 21) {
                    GameHandler.handleGameEnd(io, socket, gameState, 'bust');
                }
            } else if (action === 'stand') {
                game.dealerPlay();
                const result = game.determineWinner();
                GameHandler.handleGameEnd(io, socket, gameState, result);
            }
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    static handleGameEnd(io, socket, gameState, result) {
        try {
            const { gameId, game } = gameState;
            
            io.emit('gameEnded', {
                gameId,
                result,
                playerHand: game.playerHand.cards,
                dealerHand: game.dealerHand.cards,
                playerValue: game.playerHand.evaluate(),
                dealerValue: game.dealerHand.evaluate()
            });

            games.delete(gameId);
        } catch (error) {
            io.emit('error', { message: error.message });
        }
    }

    static handleAgentAction(io, socket, data) {
        try {
            const { gameId, agentName } = data;
            const gameState = games.get(gameId);

            if (!gameState) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            const agent = gameState.agents[agentName];
            const action = agent.strategy();

            io.emit('agentAction', {
                gameId,
                agentName,
                action
            });

            GameHandler.handlePlayerAction(io, socket, { gameId, action: action.toLowerCase() });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }
}

module.exports = GameHandler;