import { useState } from 'react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session, Vote } from '../types';
import { calculateAverage } from '../utils/average';
import ConfirmRevealDialog from './ConfirmRevealDialog';

interface RevealControlProps {
  session: Session;
  roomId: string;
  votes: Vote[];
  participants: { id: string; name: string }[];
}

export default function RevealControl({
  session,
  roomId,
  votes,
  participants,
}: RevealControlProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  async function handleReveal() {
    const sessionRef = doc(db, 'rooms', roomId, 'sessions', session.id);
    await updateDoc(sessionRef, { status: 'revealed' });
  }

  async function handleFinalize(value: string) {
    if (!value.trim()) return;
    const sessionRef = doc(db, 'rooms', roomId, 'sessions', session.id);
    await updateDoc(sessionRef, { status: 'finalized', finalValue: value.trim() });
  }

  async function handleEditFinalized() {
    const sessionRef = doc(db, 'rooms', roomId, 'sessions', session.id);
    await updateDoc(sessionRef, { status: 'revealed', finalValue: deleteField() });
    setSelectedValue(null);
  }

  function handleRevealClick() {
    const votedIds = new Set(votes.map((v) => v.participantId));
    const pending = participants.filter((p) => !votedIds.has(p.id));
    if (pending.length === 0) {
      handleReveal();
    } else {
      setShowConfirm(true);
    }
  }

  if (session.status === 'voting') {
    return (
      <>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {votes.length} / {participants.length} voted
          </span>
          <button
            onClick={handleRevealClick}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            Reveal Votes
          </button>
        </div>
        {showConfirm && (
          <ConfirmRevealDialog
            pendingParticipants={participants.filter(
              (p) => !new Set(votes.map((v) => v.participantId)).has(p.id),
            )}
            onConfirm={() => {
              setShowConfirm(false);
              handleReveal();
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </>
    );
  }

  if (session.status === 'revealed') {
    const average = calculateAverage(votes);
    const voteMap = new Map(votes.map((v) => [v.participantId, v.value]));
    const numericVotes = votes.map((v) => parseFloat(v.value)).filter((n) => !isNaN(n));
    const roundedAvg =
      numericVotes.length > 0
        ? String(Math.round(numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length))
        : '';
    const inputValue = selectedValue ?? roundedAvg;

    return (
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Results
          </h3>
          <span className="text-lg font-bold text-indigo-600">
            Avg: {average}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {participants.map((p) => {
            const vote = voteMap.get(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
              >
                <span className="text-sm text-gray-700 truncate">{p.name}</span>
                <span
                  className={`ml-2 text-lg font-bold ${
                    vote ? 'text-indigo-600' : 'text-gray-300'
                  }`}
                >
                  {vote ?? '–'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Set final estimate
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            <button
              disabled={!inputValue.trim()}
              onClick={() => handleFinalize(inputValue)}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
            >
              Finalize
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'finalized') {
    const average = calculateAverage(votes);
    const voteMap = new Map(votes.map((v) => [v.participantId, v.value]));

    return (
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Results
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-600">Avg: {average}</span>
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-0.5 rounded-full">
              Finalized: {session.finalValue}
            </span>
            <button
              onClick={handleEditFinalized}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {participants.map((p) => {
            const vote = voteMap.get(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
              >
                <span className="text-sm text-gray-700 truncate">{p.name}</span>
                <span
                  className={`ml-2 text-lg font-bold ${
                    vote ? 'text-indigo-600' : 'text-gray-300'
                  }`}
                >
                  {vote ?? '–'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
