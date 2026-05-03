import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import { useRoom } from '../hooks/useRoom';
import { useParticipants } from '../hooks/useParticipants';
import { useCurrentSession } from '../hooks/useCurrentSession';
import { useVotes } from '../hooks/useVotes';
import { useFinalizedSessions } from '../hooks/useFinalizedSessions';
import NamePrompt from '../components/NamePrompt';
import ParticipantsList from '../components/ParticipantsList';
import SessionControl from '../components/SessionControl';
import VotingCards from '../components/VotingCards';
import RevealControl from '../components/RevealControl';
import ShareRoomLink from '../components/ShareRoomLink';
import VotingHistory from '../components/VotingHistory';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, hasName } = useUser();

  const { room, loading: roomLoading, notFound } = useRoom(roomId);
  const participants = useParticipants(roomId);
  const { session, loading: sessionLoading } = useCurrentSession(roomId);
  const votes = useVotes(roomId, session?.id);
  const finalizedSessions = useFinalizedSessions(roomId);

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [joined, setJoined] = useState(false);

  // Check / re-add participant after name is set and room is loaded
  useEffect(() => {
    if (!roomId || !room || !hasName) return;

    async function ensureParticipant() {
      const pRef = doc(db, 'rooms', roomId!, 'participants', user.id);
      const snap = await getDoc(pRef);
      if (!snap.exists()) {
        await setDoc(pRef, {
          id: user.id,
          name: user.name,
          joinedAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        });
      }
      setJoined(true);
    }

    ensureParticipant();
  }, [roomId, room, hasName, user]);

  // Periodic lastSeen heartbeat
  useEffect(() => {
    if (!roomId || !joined) return;
    const interval = setInterval(async () => {
      const pRef = doc(db, 'rooms', roomId, 'participants', user.id);
      try {
        const snap = await getDoc(pRef);
        if (snap.exists()) {
          await setDoc(pRef, { lastSeen: serverTimestamp() }, { merge: true });
        }
      } catch {
        // ignore offline errors
      }
    }, 120_000);
    return () => clearInterval(interval);
  }, [roomId, joined, user.id]);

  // Keep a ref so the cleanup interval always reads the latest participants
  const participantsRef = useRef(participants);
  useEffect(() => { participantsRef.current = participants; }, [participants]);

  // Stale participant cleanup — runs every 5 minutes, not on every snapshot
  useEffect(() => {
    if (!roomId || !joined) return;
    const interval = setInterval(() => {
      const STALE_MS = 5 * 60 * 1000;
      const now = Date.now();
      participantsRef.current.forEach((p) => {
        if (p.id === user.id) return;
        const lastSeenMs = p.lastSeen?.toMillis?.() ?? 0;
        if (now - lastSeenMs > STALE_MS) {
          deleteDoc(doc(db, 'rooms', roomId, 'participants', p.id)).catch(() => {});
        }
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [roomId, joined, user.id]);

  // Check name on load
  useEffect(() => {
    if (!hasName) setShowNamePrompt(true);
  }, [hasName]);

  // Room expiry check
  const isExpired = room ? room.expiresAt.toMillis() < Date.now() : false;

  const myVote = votes.find((v) => v.participantId === user.id)?.value ?? null;
  const votedIds = new Set(votes.map((v) => v.participantId));

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading room…</p>
      </div>
    );
  }

  // ─── Not found ─────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-700">Room not found 😕</p>
        <button
          onClick={() => navigate('/')}
          className="text-indigo-600 hover:underline"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // ─── Expired ───────────────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-700">This room has expired 🕰️</p>
        <p className="text-gray-500">Rooms expire 24 hours after creation.</p>
        <button
          onClick={() => navigate('/')}
          className="text-indigo-600 hover:underline"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <>
      {showNamePrompt && (
        <NamePrompt
          title="Enter your name to join"
          onConfirm={() => setShowNamePrompt(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="w-4/5 mx-auto py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🃏</span>
              <div>
                <h1 className="font-bold text-gray-900 text-sm sm:text-base">
                  Planning Poker
                </h1>
                <p className="text-xs text-gray-400 font-mono truncate max-w-[160px] sm:max-w-xs">
                  {roomId}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (roomId && joined) {
                  deleteDoc(doc(db, 'rooms', roomId, 'participants', user.id)).catch(() => {});
                }
                navigate('/');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Leave
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="w-full lg:w-4/5 mx-auto grid grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr_1fr] py-4 lg:py-6 gap-4 lg:gap-6 px-3 lg:px-0">
          {/* Column 1 — voting area (60%) */}
          <div className="min-w-0 space-y-4">
            <SessionControl
              roomId={roomId!}
              currentSession={session}
              sessionLoading={sessionLoading}
              userName={user.name}
            />

            {session && (
              <>
                {session.status !== 'finalized' && (
                  <VotingCards
                    cardDeck={room!.cardDeck}
                    session={session}
                    roomId={roomId!}
                    participantId={user.id}
                    participantName={user.name}
                    currentVote={myVote}
                  />
                )}
                <RevealControl
                  key={session.id}
                  session={session}
                  roomId={roomId!}
                  votes={votes}
                  participants={participants}
                />
              </>
            )}
          </div>

          {/* Column 2 — participants */}
          <div className="min-w-0 space-y-4">
            <ShareRoomLink roomId={roomId!} />
            <ParticipantsList
              participants={participants}
              currentUserId={user.id}
              votedIds={votedIds}
              sessionStatus={session?.status ?? null}
            />
          </div>

          {/* Column 3 — vote history */}
          <div className="col-span-2 lg:col-span-1 min-w-0 space-y-4">
            <VotingHistory sessions={finalizedSessions} />
          </div>
        </main>
      </div>
    </>
  );
}
