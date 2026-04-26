# Planning Poker

A real-time collaborative planning poker app for agile story point estimation. Team members join a shared room, vote simultaneously with hidden cards, then reveal all votes at once to surface estimates and spark discussion.

**Live demo → [app-planning-poker.vercel.app](https://app-planning-poker.vercel.app)**

---

## Features

- **Instant rooms** — create a room in seconds, share the link, start estimating
- **Blind voting** — votes are hidden until the facilitator reveals them, preventing anchoring bias
- **Real-time sync** — all participants see votes, reveals, and new sessions live via Firestore
- **Custom card decks** — use the built-in Fibonacci deck (`1 2 3 5 8 ☕`) or define your own (e.g. T-shirt sizes, percentages)
- **Multiple sessions per room** — run back-to-back story estimations without creating a new room
- **Vote average** — numeric votes are averaged automatically after reveal; non-numeric cards (like ☕) are excluded
- **Participant presence** — live list shows who has voted (green indicator) during the voting phase
- **No sign-up required** — identity is a name + UUID stored in the browser; no accounts or passwords
- **Room expiry** — rooms automatically expire after 24 hours

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript (strict) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Database | Firebase Firestore (real-time) |
| Build tool | Vite 7 |
| Hosting | Vercel |

---

## How It Works

### The estimation flow

```
Facilitator creates a room  →  shares the URL
    ↓
Participants open the link, enter their name, and join
    ↓
Facilitator starts a session (story ID + optional description)
    ↓
Each participant clicks their estimate card  (votes are hidden)
    ↓
Facilitator clicks "Reveal Votes"
    ↓
All votes appear simultaneously  →  average is calculated
    ↓
Facilitator starts the next session or closes the room
```

### User identity

No authentication is required. When a user first visits the app, a UUID is generated and saved to `localStorage` alongside their chosen display name. This UUID is their identity across sessions — rejoining a room with the same browser restores their participant record.

### Real-time model

Each open room page holds four concurrent Firestore `onSnapshot` listeners:

| Hook | Listens to |
|---|---|
| `useRoom` | `rooms/{roomId}` |
| `useParticipants` | `rooms/{roomId}/participants` |
| `useCurrentSession` | `rooms/{roomId}/sessions` (latest 1) |
| `useVotes` | `rooms/{roomId}/sessions/{sessionId}/votes` |

All UI state is derived directly from these listeners — there is no separate client-side state management library.

---

## Local Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- A Firebase project with Firestore enabled ([console.firebase.google.com](https://console.firebase.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/erandakaanupama/app-planning-poker.git
cd app-planning-poker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Firebase project credentials:

```bash
cp .env.example .env.local
```

```env
# .env.local
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Find these values in your Firebase project under **Project Settings → General → Your apps → SDK setup and configuration**.

### 4. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Available scripts

```bash
npm run dev       # Start dev server
npm run build     # Type-check then production build
npm run lint      # Run ESLint
npm run preview   # Serve production build locally
```

---

## Firebase Setup

### Create a Firestore database

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and open your project
2. Navigate to **Firestore Database → Create database**
3. Choose **Production mode** and select a region close to your users

### Deploy Security Rules

The repository includes `firestore.rules`. Deploy them with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

> **Important:** Without security rules, your Firestore database is either fully open or fully locked. Deploy rules before running any real sessions.

### Firestore write volume

For a typical quarterly PI planning session (200 participants, 1.5 hours), the estimated Firestore write volume is:

| Source | Calculation | Writes |
|---|---|---|
| Heartbeats (every 2 min) | 200 users × 0.5/min × 90 min | 9,000 |
| Votes | 200 users × ~30 stories | 6,000 |
| Participant joins | 200 one-time writes | 200 |
| Session create / reveal | ~30 sessions × 2 | 60 |
| **Total** | | **~15,300** |

This fits within the **Spark (free) tier** limit of 20,000 writes per day for the stated load profile. If your sessions are larger or longer, upgrade to the **Blaze (pay-as-you-go)** plan — at $0.18 per 100,000 writes the cost remains negligible.

---

## Deployment

### Vercel (recommended)

The project includes a `vercel.json` that configures SPA routing so direct navigation to `/room/:id` works correctly.

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Vercel auto-detects Vite — no build settings changes needed
3. Add the six `VITE_FIREBASE_*` environment variables under **Settings → Environment Variables**
4. Deploy

Every push to `master` triggers an automatic redeploy.

### Manual build

```bash
npm run build   # output goes to /dist
```

The `/dist` folder is a standard static SPA — serve it from any static host (Netlify, GitHub Pages, Firebase Hosting, S3, etc.).

---

## Project Structure

```
src/
├── components/
│   ├── NamePrompt.tsx        # Modal for entering/updating display name
│   ├── ParticipantsList.tsx  # Live participant list with voted indicator
│   ├── RevealControl.tsx     # Vote count progress + reveal button + results grid
│   ├── SessionControl.tsx    # Start session form + current session status
│   ├── ShareRoomLink.tsx     # Copy-to-clipboard room URL widget
│   └── VotingCards.tsx       # Interactive card grid for casting votes
├── pages/
│   ├── HomePage.tsx          # Create or join a room
│   ├── CreateRoomPage.tsx    # Room creation form with deck selection
│   └── RoomPage.tsx          # Main estimation session page
├── hooks/
│   ├── useRoom.ts            # Firestore listener — room document
│   ├── useParticipants.ts    # Firestore listener — participants subcollection
│   ├── useCurrentSession.ts  # Firestore listener — latest session
│   └── useVotes.ts           # Firestore listener — votes subcollection
├── context/
│   └── UserContext.tsx       # Global local user state (name + UUID)
├── config/
│   └── firebase.ts           # Firestore initialisation (reads from env vars)
├── types/
│   └── index.ts              # Shared TypeScript interfaces
└── utils/
    ├── localStorage.ts       # User persistence helpers
    └── average.ts            # Numeric vote average calculation
```

---

## Firestore Data Model

```
rooms/{roomId}
  ├── id            string
  ├── createdAt     timestamp
  ├── expiresAt     timestamp        (createdAt + 24 hours)
  ├── cardDeck      string[]         (e.g. ["1","2","3","5","8","☕"])
  ├── createdBy     string           (participant name)
  │
  ├── participants/{participantId}
  │     ├── id          string       (UUID from localStorage)
  │     ├── name        string
  │     ├── joinedAt    timestamp
  │     └── lastSeen    timestamp    (updated every 30 seconds)
  │
  └── sessions/{sessionId}
        ├── id          string
        ├── storyId     string       (ticket ID or story name)
        ├── description string
        ├── status      "voting" | "revealed"
        ├── createdAt   timestamp
        ├── createdBy   string
        │
        └── votes/{participantId}
              ├── participantId    string
              ├── participantName  string
              ├── value            string   (the card value cast)
              └── votedAt          timestamp
```

---

## License

MIT
