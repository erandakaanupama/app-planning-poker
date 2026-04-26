import { Timestamp } from 'firebase/firestore';

export interface Room {
  id: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  cardDeck: string[];
  createdBy: string;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: Timestamp;
  lastSeen: Timestamp;
}

export type SessionStatus = 'voting' | 'revealed';

export interface Session {
  id: string;
  storyId: string;
  description: string;
  status: SessionStatus;
  createdAt: Timestamp;
  createdBy: string;
}

export interface Vote {
  participantId: string;
  participantName: string;
  value: string;
  votedAt: Timestamp;
}

export interface LocalUser {
  id: string;
  name: string;
}
