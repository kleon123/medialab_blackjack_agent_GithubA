const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const router = express.Router();

const dbPath = path.join(__dirname, '..', 'db', 'blackjack.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables on startup
function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS agents (
            agent_id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            token TEXT NOT NULL,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            busts INTEGER DEFAULT 0,
            total_earnings REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS tables (
            table_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_by TEXT NOT NULL,
            status TEXT DEFAULT 'waiting',
            current_round_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS table_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(table_id, agent_id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS rounds (
            round_id TEXT PRIMARY KEY,
            table_id TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME,
            winner_agent_id TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS actions (
            action_id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id TEXT NOT NULL,
            round_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            hand_value INTEGER,
            result TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

initDatabase();

// Auth middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    req.token = token;
    next();
}

// Get agent ID from token
function getAgentIdFromToken(token, callback) {
    db.get('SELECT agent_id FROM agents WHERE token = ?', [token], (err, row) => {
        if (err) callback(null);
        else callback(row ? row.agent_id : null);
    });
}

// Register agent
router.post('/agents/register', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const agent_id = 'agent_' + crypto.randomBytes(8).toString('hex');
    const token = crypto.randomBytes(32).toString('hex');

    db.run(
        'INSERT INTO agents (agent_id, name, token) VALUES (?, ?, ?)',
        [agent_id, name, token],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ agent_id, token, message: 'Agent registered successfully' });
        }
    );
});

// Create table
router.post('/tables', authMiddleware, (req, res) => {
    const { name } = req.body;
    getAgentIdFromToken(req.token, (agent_id) => {
        if (!agent_id) return res.status(401).json({ error: 'Invalid token' });

        const table_id = 'main';
        db.run(
            'INSERT OR IGNORE INTO tables (table_id, name, created_by) VALUES (?, ?, ?)',
            [table_id, name || 'Main Blackjack Table', agent_id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ table_id });
            }
        );
    });
});

// Join table
router.post('/tables/:table_id/join', authMiddleware, (req, res) => {
    const { table_id } = req.params;
    getAgentIdFromToken(req.token, (agent_id) => {
        if (!agent_id) return res.status(401).json({ error: 'Invalid token' });

        db.run(
            'INSERT INTO table_members (table_id, agent_id) VALUES (?, ?)',
            [table_id, agent_id],
            (err) => {
                if (err && err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Already at this table' });
                }
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Joined table' });
            }
        );
    });
});

// Get table status
router.get('/tables/:table_id/status', (req, res) => {
    const { table_id } = req.params;
    db.get('SELECT * FROM tables WHERE table_id = ?', [table_id], (err, table) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT agent_id FROM table_members WHERE table_id = ?', [table_id], (err, members) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ table, members: members.map(m => m.agent_id) });
        });
    });
});

// Start game
router.post('/tables/:table_id/start', authMiddleware, (req, res) => {
    const { table_id } = req.params;
    getAgentIdFromToken(req.token, (agent_id) => {
        if (!agent_id) return res.status(401).json({ error: 'Invalid token' });

        const round_id = 'round_' + Date.now();
        db.run('INSERT INTO rounds (round_id, table_id) VALUES (?, ?)', [round_id, table_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            db.run('UPDATE tables SET current_round_id = ? WHERE table_id = ?', [round_id, table_id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ round_id });
            });
        });
    });
});

// Hit action
router.post('/tables/:table_id/hit', authMiddleware, (req, res) => {
    const { table_id } = req.params;
    const { hand_value } = req.body;
    getAgentIdFromToken(req.token, (agent_id) => {
        if (!agent_id) return res.status(401).json({ error: 'Invalid token' });

        db.get('SELECT current_round_id FROM tables WHERE table_id = ?', [table_id], (err, table) => {
            if (err) return res.status(500).json({ error: err.message });
            db.run(
                'INSERT INTO actions (table_id, round_id, agent_id, action_type, hand_value) VALUES (?, ?, ?, ?, ?)',
                [table_id, table.current_round_id, agent_id, 'hit', hand_value],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Hit recorded' });
                }
            );
        });
    });
});

// Stand action
router.post('/tables/:table_id/stand', authMiddleware, (req, res) => {
    const { table_id } = req.params;
    const { hand_value, result } = req.body;
    getAgentIdFromToken(req.token, (agent_id) => {
        if (!agent_id) return res.status(401).json({ error: 'Invalid token' });

        db.get('SELECT current_round_id FROM tables WHERE table_id = ?', [table_id], (err, table) => {
            if (err) return res.status(500).json({ error: err.message });
            db.run(
                'INSERT INTO actions (table_id, round_id, agent_id, action_type, hand_value, result) VALUES (?, ?, ?, ?, ?, ?)',
                [table_id, table.current_round_id, agent_id, 'stand', hand_value, result],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Update agent stats
                    if (result === 'win') {
                        db.run('UPDATE agents SET wins = wins + 1 WHERE agent_id = ?', [agent_id]);
                    } else if (result === 'loss') {
                        db.run('UPDATE agents SET losses = losses + 1 WHERE agent_id = ?', [agent_id]);
                    } else if (result === 'bust') {
                        db.run('UPDATE agents SET busts = busts + 1 WHERE agent_id = ?', [agent_id]);
                    }

                    res.json({ result });
                }
            );
        });
    });
});

// Action log
router.get('/tables/:table_id/log', (req, res) => {
    const { table_id } = req.params;
    const limit = req.query.limit || 100;
    db.all(
        `SELECT a.agent_id, a.action_type, a.hand_value, a.result, a.timestamp, ag.name
         FROM actions a JOIN agents ag ON a.agent_id = ag.agent_id
         WHERE a.table_id = ? ORDER BY a.timestamp DESC LIMIT ?`,
        [table_id, limit],
        (err, actions) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(actions.reverse());
        }
    );
});

// Leaderboard
router.get('/leaderboard', (req, res) => {
    db.all(
        'SELECT agent_id, name, wins, losses, busts FROM agents ORDER BY wins DESC',
        (err, agents) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(agents);
        }
    );
});

// Get all tables
router.get('/tables', (req, res) => {
    db.all('SELECT * FROM tables', (err, tables) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tables);
    });
});

module.exports = router;
