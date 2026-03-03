import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Academy {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  logo?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TRAINER';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  academy: Academy | null;
  isAuthenticated: boolean;
  setAuth: (data: { accessToken: string; refreshToken: string; user: User; academy: Academy }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      academy: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          academy: data.academy,
          isAuthenticated: true,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          academy: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'auth-storage' }
  )
);
