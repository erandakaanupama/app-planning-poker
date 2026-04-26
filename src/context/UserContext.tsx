import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LocalUser } from '../types';
import { getOrCreateLocalUser, saveLocalUser } from '../utils/localStorage';

interface UserContextValue {
  user: LocalUser;
  setName: (name: string) => void;
  hasName: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser>(() => getOrCreateLocalUser());

  useEffect(() => {
    saveLocalUser(user);
  }, [user]);

  const setName = useCallback((name: string) => {
    setUser((prev) => {
      const updated = { ...prev, name: name.trim() };
      saveLocalUser(updated);
      return updated;
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setName, hasName: !!user.name }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
