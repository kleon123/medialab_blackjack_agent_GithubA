// blackjack-engine.js

class Deck {
    constructor() {
        this.deck = this.createDeck();
        this.shuffle();
    }

    createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return suits.flatMap(suit => {
            return values.map(value => ({ suit, value }));
        });
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCard() {
        return this.deck.pop();
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    evaluate() {
        let value = 0;
        let aces = 0;

        this.cards.forEach(card => {
            if (card.value === 'A') {
                aces++; 
                value += 11; 
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        });

        while (value > 21 && aces) {
            value -= 10;
            aces--;
        }

        return value;
    }
}

class BlackjackGame {
    constructor() {
        this.deck = new Deck();
        this.playerHand = new Hand();
        this.dealerHand = new Hand();
        this.startGame();
    }

    startGame() {
        this.playerHand.addCard(this.deck.drawCard());
        this.playerHand.addCard(this.deck.drawCard());
        this.dealerHand.addCard(this.deck.drawCard());
        this.dealerHand.addCard(this.deck.drawCard());
    }

    playerHit() {
        this.playerHand.addCard(this.deck.drawCard());
        if (this.playerHand.evaluate() > 21) {
            return 'Bust!';
        }
        return this.playerHand;
    }

    dealerPlay() {
        while (this.dealerHand.evaluate() < 17) {
            this.dealerHand.addCard(this.deck.drawCard());
        }
    }

    determineWinner() {
        const playerScore = this.playerHand.evaluate();
        const dealerScore = this.dealerHand.evaluate();

        if (playerScore > 21) {
            return 'Dealer wins!';
        }
        if (dealerScore > 21 || playerScore > dealerScore) {
            return 'Player wins!';
        } else if (dealerScore > playerScore) {
            return 'Dealer wins!';
        } else {
            return 'It\u0027s a tie!';
        }
    }
}

// Example Usage:
const game = new BlackjackGame();
console.log('Player hand:', game.playerHand);
console.log('Dealer hand:', game.dealerHand);
console.log('Winner:', game.determineWinner());