import { create } from 'zustand';
import { Alert } from 'react-native';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Todo } from '../types/todo';
import { validateTodoTitle, validateUrl, validateOutput } from '../utils/validation';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  fetchTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string, isCompleted: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateOutput: (id: string, output: string) => Promise<void>;
  updateUrl: (id: string, url: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    if (!isSupabaseConfigured()) return;
    set({ loading: true });
    try {
      const { data, error } = await getSupabase()
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ todos: data ?? [] });
    } catch (error) {
      console.error('Error fetching todos:', error);
      Alert.alert('エラー', 'Todoの取得に失敗しました');
    } finally {
      set({ loading: false });
    }
  },

  addTodo: async (title: string) => {
    if (!isSupabaseConfigured()) return;
    
    // バリデーション
    const validation = validateTodoTitle(title);
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.error || 'タスクの入力が不正です');
      return;
    }
    
    try {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインが必要です');
        return;
      }

      const { data, error } = await getSupabase()
        .from('todos')
        .insert({ title: title.trim(), user_id: user.id, is_completed: false })
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ todos: [data, ...state.todos] }));
    } catch (error) {
      console.error('Error adding todo:', error);
      Alert.alert('エラー', 'Todoの追加に失敗しました');
    }
  },

  toggleTodo: async (id: string, isCompleted: boolean) => {
    if (!isSupabaseConfigured()) return;
    const newCompleted = !isCompleted;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    // 楽観的更新
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, is_completed: newCompleted, completed_at: completedAt } : t
      ),
    }));

    try {
      const { error } = await getSupabase()
        .from('todos')
        .update({ is_completed: newCompleted, completed_at: completedAt })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating todo:', error);
      // ロールバック
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, is_completed: isCompleted, completed_at: null } : t
        ),
      }));
      Alert.alert('エラー', 'Todoの更新に失敗しました');
    }
  },

  deleteTodo: async (id: string) => {
    if (!isSupabaseConfigured()) return;
    const prevTodos = get().todos;

    // 楽観的更新
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));

    try {
      const { error } = await getSupabase().from('todos').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting todo:', error);
      set({ todos: prevTodos });
      Alert.alert('エラー', 'Todoの削除に失敗しました');
    }
  },

  updateOutput: async (id: string, output: string) => {
    if (!isSupabaseConfigured()) return;
    
    // バリデーション
    const validation = validateOutput(output);
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.error || 'アウトプットの入力が不正です');
      return;
    }
    
    const prevTodos = get().todos;

    // 楽観的更新
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, output } : t
      ),
    }));

    try {
      const { error } = await getSupabase()
        .from('todos')
        .update({ output })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating output:', error);
      set({ todos: prevTodos });
      Alert.alert('エラー', 'アウトプットの保存に失敗しました');
    }
  },

  updateUrl: async (id: string, url: string) => {
    if (!isSupabaseConfigured()) return;
    
    // バリデーション
    const validation = validateUrl(url);
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.error || 'URLの入力が不正です');
      return;
    }
    
    const prevTodos = get().todos;
    const trimmedUrl = url.trim() || null;

    // 楽観的更新
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, url: trimmedUrl } : t
      ),
    }));

    try {
      const { error } = await getSupabase()
        .from('todos')
        .update({ url: trimmedUrl })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating URL:', error);
      set({ todos: prevTodos });
      Alert.alert('エラー', 'URLの保存に失敗しました');
    }
  },
}));
