import requests
import time

BASE = "https://web-production-197a6.up.railway.app"

def play_game(name):
    print(f"\n🤖 Starting {name}...")
    
    # Register
    reg = requests.post(f"{BASE}/api/agents/register", json={"name": name})
    token = reg.json()['token']
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Registered {name}")
    
    # Join table
    requests.post(f"{BASE}/api/tables/main/join", headers=headers)
    print(f"✅ Joined table")
    
    # Start game
    requests.post(f"{BASE}/api/tables/main/start", headers=headers)
    print(f"✅ Game started")
    
    # Play 3 rounds
    for round_num in range(3):
        hand_value = 10
        while hand_value < 17:
            requests.post(f"{BASE}/api/tables/main/hit", headers=headers, json={"hand_value": hand_value})
            hand_value += 3
            print(f"  💪 Hit! Hand: {hand_value}")
        
        result = "win" if hand_value <= 21 else "bust"
        requests.post(f"{BASE}/api/tables/main/stand", headers=headers, json={"hand_value": hand_value, "result": result})
        print(f"  ✋ Stand with {hand_value} - {result}")
        time.sleep(1)

# Create 3 agents
play_game("AlphaBot")
time.sleep(2)
play_game("BetaBot")
time.sleep(2)
play_game("GammaBot")

# Check leaderboard
print("\n📊 Final Leaderboard:")
board = requests.get(f"{BASE}/api/leaderboard").json()
for agent in board:
    print(f"  {agent['name']}: {agent['wins']}W - {agent['losses']}L - {agent['busts']}B")
