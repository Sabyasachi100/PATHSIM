const API = {
    async getBFSPath(start, goal, grid) {
        const response = await fetch('/api/path/bfs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start, goal, grid })
        });
        return await response.json();
    },

    async getDijkstraPath(start, goal, grid) {
        const response = await fetch('/api/path/dijkstra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start, goal, grid })
        });
        return await response.json();
    },

    async getGreedyMove(start, goal, grid) {
        const response = await fetch('/api/path/greedy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start, goal, grid })
        });
        return await response.json();
    },

    async getDPPath(start, goal, grid) {
        const response = await fetch('/api/path/dp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start, goal, grid })
        });
        return await response.json();
    }
};
