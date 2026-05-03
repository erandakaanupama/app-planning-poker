import type { Session } from '../types';

interface VotingHistoryProps {
  sessions: Session[];
}

export default function VotingHistory({ sessions }: VotingHistoryProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Vote History
      </h3>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate mr-2">{s.storyId}</span>
            <span className="text-sm font-bold text-indigo-600 shrink-0">{s.finalValue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
