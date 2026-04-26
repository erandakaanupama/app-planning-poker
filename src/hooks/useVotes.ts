import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Vote } from '../types';

export function useVotes(roomId: string | undefined, sessionId: string | undefined) {
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    if (!roomId || !sessionId) {
      setVotes([]);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'rooms', roomId, 'sessions', sessionId, 'votes'),
      (snap) => {
        setVotes(snap.docs.map((d) => d.data() as Vote));
      },
    );

    return unsub;
  }, [roomId, sessionId]);

  return votes;
}
