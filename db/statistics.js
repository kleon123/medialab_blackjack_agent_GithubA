// db/statistics.js

const sqlite3 = require('sqlite3').verbose();

// Connect to the database
let db = new sqlite3.Database('./game_stats.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    }
});

// Create tables for tracking game statistics and agent performance
db.serialize(() => {
    // Create a table for player statistics
    db.run(`CREATE TABLE IF NOT EXISTS player_stats (
        player_id INTEGER PRIMARY KEY,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0
    );`);

    // Create a table for agent performance
    db.run(`CREATE TABLE IF NOT EXISTS agent_performance (
        agent_id INTEGER PRIMARY KEY,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0
    );`);
});

// Function to log player statistics
function logPlayerStats(playerId, won, points) {
    db.run(`INSERT INTO player_stats (player_id, games_played, games_won, total_points) VALUES (?, ?, ?, ?) ON CONFLICT(player_id) DO UPDATE SET games_played = games_played + 1, games_won = games_won + ?, total_points = total_points + ?`,
        [playerId, 1, won ? 1 : 0, points],
        function(err) {
            if (err) {
                console.error('Error logging player stats:', err);
            }
        }
    );
}

// Function to log agent performance
function logAgentPerformance(agentId, won, points) {
    db.run(`INSERT INTO agent_performance (agent_id, games_played, games_won, total_points) VALUES (?, ?, ?, ?) ON CONFLICT(agent_id) DO UPDATE SET games_played = games_played + 1, games_won = games_won + ?, total_points = total_points + ?`,
        [agentId, 1, won ? 1 : 0, points],
        function(err) {
            if (err) {
                console.error('Error logging agent performance:', err);
            }
        }
    );
}

// Close the database connection when done
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database', err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});

module.exports = { logPlayerStats, logAgentPerformance };