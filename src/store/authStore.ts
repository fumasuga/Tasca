import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,

  setSession: (session) => set({ session }),

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ initialized: true, session: null });
      return;
    }

    try {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      set({ session: data.session, initialized: true });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true, session: null });
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) return;
    try {
      await getSupabase().auth.signOut();
      set({ session: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
}));

