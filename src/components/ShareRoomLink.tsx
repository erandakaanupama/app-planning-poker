import { useState } from 'react';

interface ShareRoomLinkProps {
  roomId: string;
}

export default function ShareRoomLink({ roomId }: ShareRoomLinkProps) {
  const url = `${window.location.origin}/room/${roomId}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Share Room
      </p>
      <div className="flex flex-col gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
