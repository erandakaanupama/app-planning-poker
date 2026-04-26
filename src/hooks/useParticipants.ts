import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Participant } from '../types';

export function useParticipants(roomId: string | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'rooms', roomId, 'participants'),
      orderBy('joinedAt', 'asc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      setParticipants(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Participant));
    });

    return unsub;
  }, [roomId]);

  return participants;
}
