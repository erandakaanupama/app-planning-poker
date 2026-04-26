import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import NamePrompt from '../components/NamePrompt';

export default function HomePage() {
  const navigate = useNavigate();
  const { hasName } = useUser();
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

  function handleCreate() {
    if (!hasName) {
      setPendingAction('create');
      setShowNamePrompt(true);
      return;
    }
    navigate('/room/create');
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const rawId = joinId.trim();
    if (!rawId) return;

    // Support pasting full URLs
    let roomId = rawId;
    try {
      const url = new URL(rawId);
      const match = url.pathname.match(/\/room\/([^/]+)/);
      if (match) roomId = match[1];
    } catch {
      // plain ID — use as-is
    }

    if (!hasName) {
      setPendingAction('join');
      setShowNamePrompt(true);
      return;
    }

    setJoining(true);
    setJoinError('');
    try {
      const snap = await getDoc(doc(db, 'rooms', roomId));
      if (!snap.exists()) {
        setJoinError('Room not found. Please check the ID and try again.');
        return;
      }
      const data = snap.data();
      if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
        setJoinError('This room has expired.');
        return;
      }
      navigate(`/room/${roomId}`);
    } finally {
      setJoining(false);
    }
  }

  function handleNameConfirmed() {
    setShowNamePrompt(false);
    if (pendingAction === 'create') navigate('/room/create');
    if (pendingAction === 'join') {
      const rawId = joinId.trim();
      if (rawId) navigate(`/room/${rawId}`);
    }
    setPendingAction(null);
  }

  return (
    <>
      {showNamePrompt && <NamePrompt onConfirm={handleNameConfirmed} />}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl mb-3">♠️♥️</div>
            <h1 className="text-3xl font-extrabold text-gray-900">Planning Poker</h1>
            <p className="text-gray-500 mt-2">Estimate stories with your team in real time.</p>
          </div>

          {/* Create Room */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Create a Room</h2>
              <p className="text-sm text-gray-500">
                Set up a new estimation room and invite your team.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Create Room
            </button>
          </div>

          {/* Join Room */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Join a Room</h2>
              <p className="text-sm text-gray-500">Enter a room ID or paste the invite URL.</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Room ID or URL"
                value={joinId}
                onChange={(e) => {
                  setJoinId(e.target.value);
                  setJoinError('');
                }}
              />
              {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
              <button
                type="submit"
                disabled={joining || !joinId.trim()}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {joining ? 'Joining…' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
