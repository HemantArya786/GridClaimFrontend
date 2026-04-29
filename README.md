# Live GridClaim Board

A real-time multiplayer tile-claiming board built with a modern web stack. Users can claim tiles on a shared grid, compete on a live leaderboard, and see activity updates instantly via WebSockets.

---

## Overview

This project is a full-featured frontend for a real-time multiplayer system. It is designed with performance, scalability, and user experience in mind, including optimistic updates, smooth animations, and a fully functional mock backend for demos.

---

## Tech Stack

* React 18 + Vite + TypeScript
* Tailwind CSS
* Zustand (state management with persistence)
* Socket.IO Client
* Framer Motion
* Sonner (notifications)
* Lucide (icons)

---

## Features

### Interactive Grid

* 20×20 board (400 tiles)
* Real-time tile claiming
* Hover previews and tooltips
* Smooth claim animations
* Optimistic UI updates with rollback on failure

### Leaderboard

* Top 10 players ranked by tiles owned
* Live updates from server
* Highlight for current user
* Animated rank transitions

### Stats Dashboard

* Total claimed tiles
* Remaining tiles
* User-specific stats and ranking

### Activity Feed

* Real-time feed of tile claims
* Relative timestamps (auto-updating)
* Animated entry transitions

### Realtime System

* Socket.IO-based communication
* Auto reconnect handling
* Connection status indicator

### Mock Mode (Demo Ready)

* Runs without a backend
* Simulated players claiming tiles
* Same API contract as real server

---

## Socket.IO Contract

### Client Emits

```ts
get-grid
claim-tile: { x: number, y: number }
```

### Client Listens

```ts
grid-data: Tile[]
tile-updated: Tile
claim-failed: { x: number, y: number, reason: string }
leaderboard-updated: LeaderboardEntry[]
```

---

## Project Structure

```
src/
├── pages/
│   ├── Index.tsx
│   └── NotFound.tsx
├── components/
│   ├── Grid/
│   ├── Leaderboard/
│   ├── Stats/
│   ├── Activity/
│   ├── User/
│   ├── Header/
│   └── Common/
├── hooks/
│   ├── useSocket.ts
│   └── useTiles.ts
├── store/
│   ├── tileStore.ts
│   └── userStore.ts
├── lib/
│   ├── socket.ts
│   ├── mockSocket.ts
│   ├── api.ts
│   └── utils.ts
├── types/
├── constants/
```

---

## Installation

```bash
npm install
```

---

## Development

```bash
npm run dev
```

---

## Build and Run

```bash
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file:

```env
VITE_SOCKET_URL=http://localhost:5000
```

If not provided, the app automatically falls back to mock mode.

---

## Architecture Highlights

* Optimistic updates with rollback handling
* Efficient rendering using tile-level memoization
* State design using normalized tile storage (`Record<"x:y", Tile>`)
* Global cooldown system to prevent spam interactions
* Socket abstraction layer supporting both real and mock implementations

---

## Design System

* Minimal, clean interface
* Neutral color palette with player colors as accents
* Responsive layout across desktop, tablet, and mobile
* Accessible interactions and keyboard support

---

## Responsive Behavior

* Desktop: Grid with sidebar layout
* Tablet: Sidebar moves below grid
* Mobile: Fully stacked layout with sticky cooldown bar

---

## Limitations

* No backend included (requires Socket.IO server)
* No authentication system
* No persistent database

---

## Future Improvements

* User authentication
* Persistent game state
* Multiple game rooms
* Sound effects and enhanced animations
* Dark mode

---

## License

MIT License

---

## Author

Built as a real-time system design and frontend engineering project.
