import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session } from '../types';

interface SessionControlProps {
  roomId: string;
  currentSession: Session | null;
  sessionLoading: boolean;
  userName: string;
}

export default function SessionControl({
  roomId,
  currentSession,
  sessionLoading,
  userName,
}: SessionControlProps) {
  const [storyId, setStoryId] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!storyId.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'rooms', roomId, 'sessions'), {
        storyId: storyId.trim(),
        description: description.trim(),
        status: 'voting',
        createdAt: serverTimestamp(),
        createdBy: userName,
      });
      setStoryId('');
      setDescription('');
    } finally {
      setCreating(false);
    }
  }

  if (sessionLoading) {
    return <div className="text-gray-400 text-sm">Loading session…</div>;
  }

  // Show "currently voting" banner + new session option for revealed sessions
  if (currentSession?.status === 'voting') {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          Current story
        </p>
        <p className="font-bold text-lg text-gray-800">{currentSession.storyId}</p>
        {currentSession.description && (
          <p className="text-gray-500 text-sm mt-1">{currentSession.description}</p>
        )}
        <p className="text-indigo-500 text-sm mt-2 font-medium">Voting in progress…</p>
      </div>
    );
  }

  if (currentSession?.status === 'revealed') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">
            Revealed
          </p>
          <p className="font-bold text-lg text-gray-800">{currentSession.storyId}</p>
        </div>
        <StartSessionForm
          storyId={storyId}
          description={description}
          creating={creating}
          onStoryId={setStoryId}
          onDescription={setDescription}
          onSubmit={handleStart}
          label="Start Next Session"
        />
      </div>
    );
  }

  // No session yet
  return (
    <StartSessionForm
      storyId={storyId}
      description={description}
      creating={creating}
      onStoryId={setStoryId}
      onDescription={setDescription}
      onSubmit={handleStart}
      label="Start Session"
    />
  );
}

interface StartSessionFormProps {
  storyId: string;
  description: string;
  creating: boolean;
  onStoryId: (v: string) => void;
  onDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  label: string;
}

function StartSessionForm({
  storyId,
  description,
  creating,
  onStoryId,
  onDescription,
  onSubmit,
  label,
}: StartSessionFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </h3>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Story / Issue ID (e.g. PROJ-42)"
        value={storyId}
        onChange={(e) => onStoryId(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => onDescription(e.target.value)}
      />
      <button
        type="submit"
        disabled={creating || !storyId.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
      >
        {creating ? 'Starting…' : label}
      </button>
    </form>
  );
}
