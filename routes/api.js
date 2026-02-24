// routes/api.js

const express = require('express');
const router = express.Router();

let statisticsDB = null;

// Initialize with database instance
router.use((req, res, next) => {
    if (!statisticsDB) {
        const StatisticsDB = require('../db/statistics');
        statisticsDB = new StatisticsDB('./db/blackjack_stats.db');
    }
    next();
});

// Get all agents statistics
router.get('/agents/stats', async (req, res) => {
    try {
        statisticsDB.db.all('SELECT * FROM agents ORDER BY id DESC', (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific agent statistics
router.get('/agents/:agentId/stats', async (req, res) => {
    try {
        statisticsDB.db.get('SELECT * FROM agents WHERE id = ?', [req.params.agentId], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(row);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register new agent
router.post('/agents', async (req, res) => {
    try {
        const { name } = req.body;
        statisticsDB.registerAgent(name);
        res.json({ message: 'Agent registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record game result
router.post('/game-results', async (req, res) => {
    try {
        const { agentId, result } = req.body;
        statisticsDB.recordGameResult(agentId, result);
        res.json({ message: 'Game result recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;