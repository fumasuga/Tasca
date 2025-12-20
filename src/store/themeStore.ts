import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  initialized: boolean;
  initialize: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  initialized: false,
  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({ mode: stored, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      set({ initialized: true });
    }
  },
  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
  toggle: async () => {
    const current = get().mode;
    const next = current === 'dark' ? 'light' : 'dark';
    await get().setMode(next);
  },
}));

