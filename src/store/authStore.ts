import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteUser: (t: (key: string) => string) => Promise<void>;
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

  deleteUser: async (t: (key: string) => string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert(t('error'), t('userNotFound'));
        return;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        Alert.alert(t('error'), t('supabaseConfigIncomplete'));
        return;
      }

      // Edge Functionを呼び出してユーザーを削除
      // Edge Functionが設定されていない場合は、エラーメッセージを表示
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert(t('error'), t('sessionNotFound'));
        return;
      }

      // Edge Functionを呼び出す
      // 認証トークンは自動的にヘッダーに含まれるため、bodyにuserIdを含める必要はない
      // Edge Function側で認証されたユーザーのIDを使用する
      const { data, error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
        body: { userId: user.id }, // セキュリティチェック用（オプション）
      });

      if (error) {
        // Edge Functionが存在しない場合は、エラーメッセージを表示
        throw new Error(t('deleteAccountFunctionNotAvailable'));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // 削除成功後、セッションをクリア
      await supabase.auth.signOut();
      set({ session: null });
    } catch (error: any) {
      console.error('Delete user error:', error);
      Alert.alert(t('error'), error?.message || t('failedToDeleteAccount'));
      throw error;
    }
  },
}));

