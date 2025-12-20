import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { GraphData } from '../types/graph';

export async function fetchCompletedTodosForGraph(): Promise<GraphData[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await getSupabase()
    .from('todos')
    .select('completed_at')
    .not('completed_at', 'is', null)
    .gte('completed_at', oneYearAgo.toISOString());

  if (error) {
    console.error('Error fetching completed todos:', error);
    throw error;
  }

  // 日付ごとの完了数を集計
  const countMap = new Map<string, number>();

  (data ?? []).forEach((todo) => {
    if (todo.completed_at) {
      const date = todo.completed_at.split('T')[0]; // YYYY-MM-DD形式
      countMap.set(date, (countMap.get(date) ?? 0) + 1);
    }
  });

  // GraphData形式に変換
  const result: GraphData[] = [];
  countMap.forEach((count, date) => {
    result.push({ date, count });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

