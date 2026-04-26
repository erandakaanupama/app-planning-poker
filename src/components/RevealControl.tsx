import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session, Vote } from '../types';
import { calculateAverage } from '../utils/average';

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
  async function handleReveal() {
    const sessionRef = doc(db, 'rooms', roomId, 'sessions', session.id);
    await updateDoc(sessionRef, { status: 'revealed' });
  }

  if (session.status === 'voting') {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {votes.length} / {participants.length} voted
        </span>
        <button
          onClick={handleReveal}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Reveal Votes
        </button>
      </div>
    );
  }

  if (session.status === 'revealed') {
    const average = calculateAverage(votes);
    const voteMap = new Map(votes.map((v) => [v.participantId, v.value]));

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
      </div>
    );
  }

  return null;
}
