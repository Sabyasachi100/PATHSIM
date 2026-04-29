from flask import Flask, render_template, jsonify, request
import heapq
from collections import deque

app = Flask(__name__)

# Grid constants
ROWS = 15
COLS = 20

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/path/bfs', methods=['POST'])
def get_bfs_path():
    data = request.json
    start = tuple(data['start'])  # [r, c]
    goal = tuple(data['goal'])
    grid = data['grid']  # 0 for empty, 1 for wall

    queue = deque([([start[0], start[1]], [start])])
    visited = {start}
    
    while queue:
        (r, c), path = queue.popleft()
        
        if (r, c) == goal:
            return jsonify({'path': path})
            
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != 1 and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append(([nr, nc], path + [[nr, nc]]))
                
    return jsonify({'path': []})

@app.route('/api/path/dijkstra', methods=['POST'])
def get_dijkstra_path():
    data = request.json
    start = tuple(data['start'])
    goal = tuple(data['goal'])
    grid = data['grid'] # 0: empty, 1: wall, 2: trap (weight 5), 3: mud (weight 2)
    
    weights = {0: 1, 1: float('inf'), 2: 10, 3: 4}
    
    pq = [(0, start, [start])]
    distances = {start: 0}
    
    while pq:
        dist, (r, c), path = heapq.heappop(pq)
        
        if (r, c) == goal:
            return jsonify({'path': path})
            
        if dist > distances.get((r, c), float('inf')):
            continue
            
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < ROWS and 0 <= nc < COLS:
                cell_type = grid[nr][nc]
                if cell_type == 1: continue
                
                new_dist = dist + weights.get(cell_type, 1)
                if new_dist < distances.get((nr, nc), float('inf')):
                    distances[(nr, nc)] = new_dist
                    heapq.heappush(pq, (new_dist, (nr, nc), path + [[nr, nc]]))
                    
    return jsonify({'path': []})

@app.route('/api/path/greedy', methods=['POST'])
def get_greedy_move():
    data = request.json
    start = data['start']
    goal = data['goal']
    grid = data['grid']
    
    r, c = start
    best_move = None
    min_dist = float('inf')
    
    for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != 1:
            dist = abs(nr - goal[0]) + abs(nc - goal[1])
            if dist < min_dist:
                min_dist = dist
                best_move = [nr, nc]
                
    return jsonify({'next_move': best_move or start})

@app.route('/api/path/dp', methods=['POST'])
def get_dp_path():
    """Find path that maximizes coin collection (score) while moving towards goal."""
    data = request.json
    start = tuple(data['start'])
    goal = tuple(data['goal'])
    grid = data['grid'] # 4: coin
    
    # Simple DP approach: we only move towards the goal (no backtracking to keep it simple for visualization)
    # If goal is to the right and down, we only move right and down.
    # For a more robust DP, we'd use a different formulation, but for a 15x20 grid, 
    # we can use a memoized search.
    
    memo = {}
    
    def solve(r, c):
        if (r, c) == goal:
            return (grid[r][c] == 4, [[r, c]])
        
        if (r, c) in memo:
            return memo[(r, c)]
        
        max_coins = -1
        best_path = []
        
        # Determine allowed directions based on goal
        dirs = []
        if r < goal[0]: dirs.append((1, 0))
        elif r > goal[0]: dirs.append((-1, 0))
        if c < goal[1]: dirs.append((0, 1))
        elif c > goal[1]: dirs.append((0, -1))
        
        # If already on same row/col, allow moving in orthogonal directions to avoid obstacles?
        # For simplicity, let's just allow all 4 directions but with a depth limit or distance constraint.
        # Actually, let's use a simpler DP: find max coins in a subgrid defined by start and goal.
        
        current_coin = 1 if grid[r][c] == 4 else 0
        
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != 1:
                coins, path = solve(nr, nc)
                if coins != -1:
                    if coins + current_coin > max_coins:
                        max_coins = coins + current_coin
                        best_path = [[r, c]] + path
        
        memo[(r, c)] = (max_coins, best_path)
        return memo[(r, c)]

    coins, path = solve(start[0], start[1])
    return jsonify({'path': path if coins != -1 else []})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
