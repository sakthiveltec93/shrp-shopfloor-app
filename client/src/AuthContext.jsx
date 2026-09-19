import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api';
import safeStorage from './utils/safeStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = safeStorage.getItem('shrp_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, pin) => {
    const { token, user } = await api.login(username, pin);
    safeStorage.setItem('shrp_token', token);
    safeStorage.setItem('shrp_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    safeStorage.removeItem('shrp_token');
    safeStorage.removeItem('shrp_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
