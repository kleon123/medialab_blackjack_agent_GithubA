const express = require('express');
const router = express.Router();

let balance = 100; // Starting balance

router.post('/bet', (req, res) => {
    const { betAmount } = req.body;

    if (betAmount <= 0 || betAmount > balance) {
        return res.status(400).json({ message: 'Invalid bet amount.' });
    }

    balance -= betAmount; // Deduct bet amount from balance
    res.json({ message: 'Bet placed.', balance });
});

router.post('/result', (req, res) => {
    const { outcome } = req.body; // 'win', 'loss', or 'bust'

    switch (outcome) {
        case 'win':
            balance += betAmount * 2; // Win payout
            res.json({ message: 'You won!', balance });
            break;
        case 'loss':
            res.json({ message: 'You lost.', balance });
            break;
        case 'bust':
            res.json({ message: 'You busted.', balance });
            break;
        default:
            res.status(400).json({ message: 'Invalid outcome.' });
    }
});

module.exports = router;