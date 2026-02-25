# API Documentation for Agent Integration

## Introduction
This documentation provides the necessary information for integrating with the blackjack agent.

## Base URL
The correct Base URL for the blackjack agent is:  
`https://web-production-197a6.up.railway.app`

## Endpoints

### 1. Start Game
**POST** `/api/game/start`
- **Description:** Starts a new game.
- **Request Body:**  
  ```json
  {
    "playerID": "string"
  }
  ```
- **Response:**  
  ```json
  {
    "gameID": "string",
    "status": "string"
  }
  ```

### 2. Make a Move
**POST** `/api/game/move`
- **Description:** Makes a move in the current game.
- **Request Body:**  
  ```json
  {
    "gameID": "string",
    "action": "string"
  }
  ```
- **Response:**  
  ```json
  {
    "status": "string",
    "gameState": "object"
  }
  ```

### 3. End Game
**POST** `/api/game/end`
- **Description:** Ends the current game.
- **Request Body:**  
  ```json
  {
    "gameID": "string"
  }
  ```
- **Response:**  
  ```json
  {
    "status": "string"
  }
  ```

## Conclusion
All interactions should take place at the specified base URL. Make sure to follow the API documentation for a smooth integration.