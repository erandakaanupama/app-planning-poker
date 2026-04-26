import type { Participant } from '../types';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string;
  votedIds?: Set<string>;
  sessionStatus?: 'voting' | 'revealed' | null;
}

export default function ParticipantsList({
  participants,
  currentUserId,
  votedIds = new Set(),
  sessionStatus,
}: ParticipantsListProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Participants ({participants.length})
      </h3>
      <ul className="space-y-2">
        {participants.map((p) => {
          const isYou = p.id === currentUserId;
          const hasVoted = votedIds.has(p.id);
          return (
            <li key={p.id} className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">
                {p.name} {isYou && <span className="text-xs text-indigo-400">(you)</span>}
              </span>
              {sessionStatus === 'voting' && (
                <span
                  className={`w-2.5 h-2.5 rounded-full ${hasVoted ? 'bg-green-400' : 'bg-gray-300'}`}
                  title={hasVoted ? 'Voted' : 'Not voted yet'}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
