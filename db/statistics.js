class StatisticsDB {
    constructor(databasePath) {
        this.databasePath = databasePath;
        this.init();
    }

    init() {
        const sqlite3 = require('sqlite3').verbose();
        this.db = new sqlite3.Database(this.databasePath, (err) => {
            if (err) {
                console.error('Could not connect to database:', err);
            } else {
                console.log('Connected to the SQLite database.');
                this.createTables();
            }
        });
    }

    createTables() {
        const agentTable = `CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            stats TEXT
        );`;

        const gameResultsTable = `CREATE TABLE IF NOT EXISTS game_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id INTEGER,
            result TEXT,
            FOREIGN KEY (agent_id) REFERENCES agents(id)
        );`;

        this.db.exec(agentTable, (err) => {
            if (err) {
                console.error('Could not create agents table:', err);
            }
        });

        this.db.exec(gameResultsTable, (err) => {
            if (err) {
                console.error('Could not create game results table:', err);
            }
        });
    }

    registerAgent(agentName) {
        const query = `INSERT INTO agents (name) VALUES (?);`;
        this.db.run(query, [agentName], function (err) {
            if (err) {
                return console.error('Could not register agent:', err);
            }
            console.log(`Registered agent with ID: ${this.lastID}`);
        });
    }

    recordGameResult(agentId, result) {
        const query = `INSERT INTO game_results (agent_id, result) VALUES (?, ?);`;
        this.db.run(query, [agentId, result], function (err) {
            if (err) {
                return console.error('Could not record game result:', err);
            }
            console.log(`Recorded game result for agent ID: ${agentId}`);
        });
    }

    updateAgentStatistics(agentId, stats) {
        const query = `UPDATE agents SET stats = ? WHERE id = ?;`;
        this.db.run(query, [stats, agentId], function (err) {
            if (err) {
                return console.error('Could not update agent statistics:', err);
            }
            console.log(`Updated statistics for agent ID: ${agentId}`);
        });
    }
}

module.exports = StatisticsDB;
