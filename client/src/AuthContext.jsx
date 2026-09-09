import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('shrp_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (username, pin) => {
    const { token, user } = await api.login(username, pin);
    localStorage.setItem('shrp_token', token);
    localStorage.setItem('shrp_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shrp_token');
    localStorage.removeItem('shrp_user');
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
