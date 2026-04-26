# Planning Poker App

A real-time collaborative planning poker app for agile story estimation. Team members join a room, vote on story point cards simultaneously (blind voting), then reveal all votes at once.

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **React Router 7** for client-side routing
- **Firebase 12 / Firestore** for real-time data sync
- **Tailwind CSS 4** for all styling (no CSS modules, no CSS-in-JS)
- **Vite 7** as dev server and build tool
- **UUID** for generating room/participant IDs

## Project Structure

```
src/
├── components/     # Reusable UI pieces (VotingCards, ParticipantsList, etc.)
├── pages/          # Route-level components (HomePage, CreateRoomPage, RoomPage)
├── hooks/          # Custom hooks — one per Firestore collection/document listener
├── context/        # UserContext — local user state (name + UUID)
├── config/         # firebase.ts — Firestore initialization
├── types/          # index.ts — all shared TypeScript interfaces
└── utils/          # localStorage helpers, vote average calculation
```

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check (tsc -b) then production build
npm run lint      # Run ESLint
npm run preview   # Serve production build locally
```

## Firestore Data Model

```
rooms/{roomId}
  ├── id, createdAt, expiresAt, createdBy, cardDeck[]
  ├── participants/{participantId}
  │     └── id, name, joinedAt, lastSeen
  └── sessions/{sessionId}
        ├── storyId, description, status ("voting" | "revealed"), createdAt
        └── votes/{participantId}
              └── participantId, participantName, card, timestamp
```

## Coding Conventions

**Naming:**
- Components and interfaces: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- Constants: `UPPER_SNAKE_CASE`
- Prop interfaces: `ComponentNameProps` suffix

**Patterns:**
- All components are functional arrow functions — no class components
- Custom hooks own Firestore `onSnapshot` listeners and return cleanup functions
- Form handlers are `async`, use `try/finally` with a loading state boolean
- Conditional rendering returns `null` rather than hidden elements
- All props and event handlers fully typed — never use `any`
- No React import needed (automatic JSX transform is enabled)

**Styling:**
- Tailwind utility classes only — never add new CSS files
- Conditional classes use template literals: `` `${condition ? 'class-a' : 'class-b'}` ``

**TypeScript:**
- Strict mode is on — `noUnusedLocals`, `noUnusedParameters` enforced
- Use `type` keyword for type-only imports: `import type { Room } from '../types'`

## Domain Knowledge

- **Room**: Created by a facilitator, expires after 24 hours, holds a card deck
- **Session**: One story being estimated; status moves `voting` → `revealed`
- **Participant**: Identified by a UUID stored in localStorage (no auth)
- **Vote**: One per participant per session; hidden until facilitator reveals
- **Heartbeat**: Each participant updates `lastSeen` every 30 seconds

## Key Decisions

- No auth — users identify by self-entered name; UUID persisted in localStorage
- Firestore is the single source of truth; no client-side state management library
- Firebase config is hardcoded (public browser credentials — intentional for this project)
- Room join supports both raw room IDs and full URLs
