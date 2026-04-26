import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session, Vote } from '../types';

interface VotingCardsProps {
  cardDeck: string[];
  session: Session;
  roomId: string;
  participantId: string;
  participantName: string;
  currentVote: string | null;
}

export default function VotingCards({
  cardDeck,
  session,
  roomId,
  participantId,
  participantName,
  currentVote,
}: VotingCardsProps) {
  async function handleVote(value: string) {
    const voteRef = doc(
      db,
      'rooms',
      roomId,
      'sessions',
      session.id,
      'votes',
      participantId,
    );
    const voteData: Vote = {
      participantId,
      participantName,
      value,
      votedAt: serverTimestamp() as Vote['votedAt'],
    };
    await setDoc(voteRef, voteData);
    // Update lastSeen for participant
    const participantRef = doc(db, 'rooms', roomId, 'participants', participantId);
    await updateDoc(participantRef, { lastSeen: serverTimestamp() });
  }

  if (session.status === 'revealed') {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Cast Your Vote
      </h3>
      <div className="flex flex-wrap gap-2">
        {cardDeck.map((card) => {
          const isSelected = currentVote === card;
          return (
            <button
              key={card}
              onClick={() => handleVote(card)}
              className={`w-14 h-20 rounded-xl text-xl font-bold border-2 transition-all cursor-pointer select-none
                ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:scale-105'
                }`}
            >
              {card}
            </button>
          );
        })}
      </div>
      {currentVote && (
        <p className="text-sm text-indigo-500 mt-3">
          Your vote: <span className="font-bold">{currentVote}</span>
        </p>
      )}
    </div>
  );
}
