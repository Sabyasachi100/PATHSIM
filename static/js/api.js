const ROWS = 15;
const COLS = 20;

const API = {
    async getBFSPath(start, goal, grid) {
        const queue = [{ pos: start, path: [start] }];
        const visited = new Set([`${start[0]},${start[1]}`]);

        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            const [r, c] = pos;

            if (r === goal[0] && c === goal[1]) {
                return { path };
            }

            for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== 1) {
                    const key = `${nr},${nc}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ pos: [nr, nc], path: [...path, [nr, nc]] });
                    }
                }
            }
        }
        return { path: [] };
    },

    async getDijkstraPath(start, goal, grid) {
        const weights = { 0: 1, 1: Infinity, 2: 10, 3: 4, 4: 1 };
        const pq = [{ dist: 0, pos: start, path: [start] }];
        const distances = { [`${start[0]},${start[1]}`]: 0 };

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const { dist, pos, path } = pq.shift();
            const [r, c] = pos;

            if (r === goal[0] && c === goal[1]) return { path };
            if (dist > (distances[`${r},${c}`] || Infinity)) continue;

            for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    const cellType = grid[nr][nc];
                    if (cellType === 1) continue;
                    
                    const newDist = dist + (weights[cellType] || 1);
                    const key = `${nr},${nc}`;
                    if (newDist < (distances[key] || Infinity)) {
                        distances[key] = newDist;
                        pq.push({ dist: newDist, pos: [nr, nc], path: [...path, [nr, nc]] });
                    }
                }
            }
        }
        return { path: [] };
    },

    async getGreedyMove(start, goal, grid) {
        let bestMove = null;
        let minDist = Infinity;
        const [r, c] = start;

        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== 1) {
                const dist = Math.abs(nr - goal[0]) + Math.abs(nc - goal[1]);
                if (dist < minDist) {
                    minDist = dist;
                    bestMove = [nr, nc];
                }
            }
        }
        return { next_move: bestMove || start };
    },

    async getDPPath(start, goal, grid) {
        const memo = new Map();

        function solve(r, c) {
            const key = `${r},${c}`;
            if (r === goal[0] && c === goal[1]) return { coins: grid[r][c] === 4 ? 1 : 0, path: [[r, c]] };
            if (memo.has(key)) return memo.get(key);

            let maxCoins = -1;
            let bestPath = [];

            const dirs = [];
            if (r < goal[0]) dirs.push([1, 0]);
            else if (r > goal[0]) dirs.push([-1, 0]);
            if (c < goal[1]) dirs.push([0, 1]);
            else if (c > goal[1]) dirs.push([0, -1]);

            const currentCoin = grid[r][c] === 4 ? 1 : 0;

            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== 1) {
                    const res = solve(nr, nc);
                    if (res.coins !== -1) {
                        if (res.coins + currentCoin > maxCoins) {
                            maxCoins = res.coins + currentCoin;
                            bestPath = [[r, c], ...res.path];
                        }
                    }
                }
            }

            const result = { coins: maxCoins, path: bestPath };
            memo.set(key, result);
            return result;
        }

        const res = solve(start[0], start[1]);
        return { path: res.coins !== -1 ? res.path : [] };
    }
};
