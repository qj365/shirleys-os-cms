import { type Omit_User_createdAt_or_updatedAt_ } from '@/lib/api/admin';
import { auth } from '@/lib/firebase';
import { getPath } from '@/routers/router-paths';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import type { NavigateFunction } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  appUser: Omit_User_createdAt_or_updatedAt_ | null;
  user: User | null; //firebase user
  token: string | null; //firebase auth token
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAppUser: (appUser: Omit_User_createdAt_or_updatedAt_ | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      appUser: null,
      user: null,
      token: null,
      loading: true,
      signup: async (email, password) => {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        set({
          user: credential.user,
          token: await credential.user.getIdToken(),
        });
      },
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        set({
          user: credential.user,
          token: await credential.user.getIdToken(),
        });
      },
      logout: async () => {
        await signOut(auth);
        set({ user: null, token: null, appUser: null });
      },
      setUser: user => set({ user }),
      setToken: token => set({ token }),
      setLoading: loading => set({ loading }),
      setAppUser: appUser => set({ appUser }),
    }),
    {
      name: 'auth-storage', // Key in localStorage
      partialize: state => ({
        user: state.user ? JSON.parse(JSON.stringify(state.user)) : null,
        token: state.token,
      }), // Serialize user object
    }
  )
);

// Hydrate state with Firebase listener (call this in a top-level component or hook)
export const initializeAuth = (navigate: NavigateFunction) => {
  const { setUser, setToken, setLoading } = useAuthStore.getState();
  onAuthStateChanged(auth, async user => {
    if (user) {
      const token = await user.getIdToken();
      setUser(user);
      setToken(token);
    } else {
      setUser(null);
      setToken(null);
      navigate(getPath('login'), { replace: true });
    }
    setLoading(false);
  });
};
