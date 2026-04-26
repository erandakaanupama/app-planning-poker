import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

interface NamePromptProps {
  onConfirm?: () => void;
  title?: string;
}

export default function NamePrompt({ onConfirm, title = 'Enter your name' }: NamePromptProps) {
  const { user, setName } = useUser();
  const [value, setValue] = useState(user.name);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    setName(trimmed);
    onConfirm?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your display name"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
