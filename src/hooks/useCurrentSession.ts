import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session } from '../types';

export function useCurrentSession(roomId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);

    const q = query(
      collection(db, 'rooms', roomId, 'sessions'),
      orderBy('createdAt', 'desc'),
      limit(1),
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setSession({ id: d.id, ...d.data() } as Session);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [roomId]);

  return { session, loading };
}
