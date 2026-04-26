import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import NamePrompt from '../components/NamePrompt';

const DEFAULT_DECK = ['1', '2', '3', '5', '8', '☕'];

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { user, hasName } = useUser();
  const [useDefault, setUseDefault] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const parsedCustom = customInput
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const cardDeck = useDefault ? DEFAULT_DECK : parsedCustom;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (cardDeck.length === 0) {
      setError('Please provide at least one card value.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const roomId = uuidv4();
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        createdAt: serverTimestamp(),
        expiresAt,
        cardDeck,
        createdBy: user.name,
      });

      // Add creator as participant
      await setDoc(doc(db, 'rooms', roomId, 'participants', user.id), {
        id: user.id,
        name: user.name,
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });

      navigate(`/room/${roomId}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  if (!hasName) {
    return <NamePrompt title="Enter your name to create a room" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 text-sm hover:underline mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">Create a Room</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your estimation session.</p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Card Deck */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800">Card Deck</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                className="mt-1 accent-indigo-600"
                checked={useDefault}
                onChange={() => setUseDefault(true)}
              />
              <div>
                <p className="font-medium text-gray-700">Default deck</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {DEFAULT_DECK.map((c) => (
                    <span
                      key={c}
                      className="w-10 h-14 flex items-center justify-center rounded-lg border-2 border-gray-200 text-lg font-bold text-gray-600 bg-gray-50"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                className="mt-1 accent-indigo-600"
                checked={!useDefault}
                onChange={() => setUseDefault(false)}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-700">Custom deck</p>
                <input
                  type="text"
                  disabled={useDefault}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  placeholder="e.g. 10, 20, 30, 40, 100"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setError('');
                  }}
                />
                {!useDefault && parsedCustom.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {parsedCustom.map((c) => (
                      <span
                        key={c}
                        className="w-10 h-14 flex items-center justify-center rounded-lg border-2 border-indigo-200 text-lg font-bold text-indigo-600 bg-indigo-50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {creating ? 'Creating…' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
