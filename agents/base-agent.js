// Base Agent Class
class BaseAgent {
    constructor(name) {
        this.name = name;
    }

    // Define a default strategy method
    strategy() {
        throw new Error('Strategy method must be implemented.');
    }
}

// Strategy Implementations
class RandomStrategy extends BaseAgent {
    strategy() {
        // Implement random strategy logic
        return Math.random() > 0.5 ? 'Hit' : 'Stand';
    }
}

class AggressiveStrategy extends BaseAgent {
    strategy() {
        // Implement aggressive strategy logic
        return 'Hit';
    }
}

class ConservativeStrategy extends BaseAgent {
    strategy() {
        // Implement conservative strategy logic
        return 'Stand';
    }
}

// Exporting Strategies
module.exports = { BaseAgent, RandomStrategy, AggressiveStrategy, ConservativeStrategy };