# PATHSIM: Multi-Algorithm Game AI 🤖

**🔴 Play the Live Demo:** [https://pathsim.onrender.com](https://pathsim.onrender.com)

PATHSIM is an interactive, grid-based web game designed to visually demonstrate and compare the efficiency of different AI pathfinding algorithms. Play as the user trying to reach the goal while outsmarting an AI enemy that actively hunts you down using various mathematical strategies.

## ✨ Features
*   **Real-time AI Path Visualization:** See the exact mathematical path the AI calculates in real-time as you move.
*   **Multiple Algorithm Modes:**
    *   ⚡ **Greedy Best-First:** Fast but gets stuck easily on obstacles.
    *   ⊗ **Breadth-First Search (BFS):** Calculates the absolute shortest path, ignoring grid weights.
    *   ◎ **Dijkstra (Smart AI):** Calculates weighted paths to intelligently avoid traps and mud.
    *   ★ **Strategy Mode:** A dual-path visualizer comparing the shortest path (BFS) vs. the highest scoring path (Dynamic Programming).
*   **Dynamic Grid Mechanics:** Navigate around Walls, Sticky Mud (slows you down), Traps (score penalty + screen shake), and Coins (bonus points).
*   **Premium UI/UX:** Built with a custom glassmorphic interface, animated canvas background, and persistent match history using `localStorage`.

## 🛠️ Tech Stack
*   **Backend:** Python 3, Flask (RESTful APIs for algorithm calculations)
*   **Frontend:** Vanilla JavaScript, HTML5, CSS3 (CSS Grid, Animations, Glassmorphism)

## 🚀 How to Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
2. Install Flask:
   ```bash
   pip install flask
   ```
3. Run the backend server:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to `http://127.0.0.1:5000`
