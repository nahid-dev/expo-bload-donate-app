import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // Don't store Firebase User object in AsyncStorage as it's not serializable
    // The auth state will be managed by Firebase auth state listener
  },
  setUserProfile: (profile) => {
    set({ userProfile: profile });
    if (profile) {
      AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      AsyncStorage.removeItem('userProfile');
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    await AsyncStorage.removeItem('userProfile');
    set({ user: null, userProfile: null, isAuthenticated: false });
  },
}));

