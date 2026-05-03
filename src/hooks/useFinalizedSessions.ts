import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session } from '../types';

export function useFinalizedSessions(roomId: string | undefined) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'rooms', roomId, 'sessions'),
      orderBy('createdAt', 'asc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const finalized = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Session))
        .filter((s) => s.status === 'finalized');
      setSessions(finalized);
    });

    return unsub;
  }, [roomId]);

  return sessions;
}
