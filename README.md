# Blackjack AI Agents Game

## Description
This project is designed to simulate a Blackjack game environment incorporating various AI agents. The goal is to analyze the performance of different strategies for playing Blackjack.

## Features
- Multiple AI agents with varying strategies
- Real-time game simulation
- Performance metrics for agents
- Interactive command-line interface
- Ability to customize agent strategies and game rules

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/kleon123/medialab_blackjack_agent_GithubA.git
   ```
2. Navigate into the project directory:
   ```bash
   cd medialab_blackjack_agent_GithubA
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   (You must have Python 3.x installed)

## Game Rules
- The game is played with one or more decks of cards.
- Each player is dealt two cards, with the dealer receiving one card face up and one card face down.
- Players can choose to "hit" (take another card) or "stand" (keep their current hand).
- The aim is to reach a hand value as close to 21 as possible without exceeding it.
- Face cards (Kings, Queens, Jacks) are worth 10 points, Aces can be worth 1 or 11 points, and all other cards are worth their face value.

## API Endpoints
- **Start Game:** `/api/start` - Begins a new game.
- **Hit:** `/api/hit` - Requests another card for the player.
- **Stand:** `/api/stand` - Ends the player's turn.
- **Get Status:** `/api/status` - Retrieves the current game status.

## Technologies Used
- Python
- Flask for the API
- NumPy for numerical calculations
- Matplotlib for game outcome visualization

## Author
- **Name:** Kleon123
- **Contact:** [your-email@example.com]

---

This README provides an overview of the Blackjack AI Agents Game project and serves as a guide for users and developers.