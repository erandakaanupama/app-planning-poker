interface ConfirmRevealDialogProps {
  pendingParticipants: { id: string; name: string }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmRevealDialog({
  pendingParticipants,
  onConfirm,
  onCancel,
}: ConfirmRevealDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Not everyone has voted yet</h2>
        <p className="text-sm text-gray-500 mb-4">
          The following {pendingParticipants.length === 1 ? 'participant has' : 'participants have'} not voted:
        </p>
        <ul className="mb-6 space-y-1">
          {pendingParticipants.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              {p.name}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Reveal anyway
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
