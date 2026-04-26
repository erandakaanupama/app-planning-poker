import { v4 as uuidv4 } from 'uuid';
import type { LocalUser } from '../types';

const USER_KEY = 'planning_poker_user';

export function getLocalUser(): LocalUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function saveLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getOrCreateLocalUser(): LocalUser {
  const existing = getLocalUser();
  if (existing) return existing;
  const user: LocalUser = { id: uuidv4(), name: '' };
  saveLocalUser(user);
  return user;
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}
