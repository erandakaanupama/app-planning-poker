import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Room } from '../types';

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    setNotFound(false);

    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() } as Room);
        setNotFound(false);
      } else {
        setRoom(null);
        setNotFound(true);
      }
      setLoading(false);
    });

    return unsub;
  }, [roomId]);

  return { room, loading, notFound };
}
