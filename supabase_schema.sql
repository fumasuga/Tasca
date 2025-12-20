-- todosテーブル作成
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 500),
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 3), -- 0:低, 1:中, 2:高, 3:緊急
  due_date TIMESTAMP WITH TIME ZONE,
  output TEXT, -- アウトプット（振り返り・メモ）
  url TEXT CHECK (url IS NULL OR char_length(url) <= 2000) -- 関連URL
);

-- 既存テーブルにカラムを追加する場合（マイグレーション用）
-- ALTER TABLE todos ADD COLUMN IF NOT EXISTS output TEXT;
-- ALTER TABLE todos ADD COLUMN IF NOT EXISTS url TEXT CHECK (url IS NULL OR char_length(url) <= 2000);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_completed_at ON todos(completed_at) WHERE completed_at IS NOT NULL;

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 有効化
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

