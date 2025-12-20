export interface Todo {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  user_id: string;
  priority?: number; // 0:低, 1:中, 2:高, 3:緊急
  due_date?: string | null;
  output?: string | null;
  url?: string | null;
}
