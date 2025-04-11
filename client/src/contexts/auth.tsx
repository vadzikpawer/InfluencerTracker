import { create } from 'zustand';
import { auth } from '@/lib/api';
import { User, UserRole } from '@/lib/types';
import { useLocation } from 'wouter';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (username: string, password: string) => {
    const response = await auth.login(username, password);
    localStorage.setItem('token', response.access_token);
    set({ token: response.access_token, isAuthenticated: true });
    const [, setLocation] = useLocation();
    setLocation('/');
  },
  register: async (username: string, password: string, name: string, role: UserRole) => {
    const response = await auth.register(username, password, name, role);
    localStorage.setItem('token', response.access_token);
    set({ token: response.access_token, isAuthenticated: true, user: response.user });
    const [, setLocation] = useLocation();
    setLocation('/');
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    const [, setLocation] = useLocation();
  },
})); 