# ✓ Tasca

**シンプルで美しいタスク管理アプリ**

Expo (React Native) + TypeScript + Supabase を使用したモダンなタスク管理アプリケーション

> **Tasca** = Task + α（付加価値のあるタスク管理）

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 機能

- **セキュアな認証** - Supabase Authによるメール/パスワード認証
- **タスク管理** - 追加・完了・削除のスムーズな操作
- **完了履歴** - GitHubスタイルのコントリビューショングラフ
- **モダンUI** - アニメーションとグラデーションを活用した洗練されたデザイン
- **クロスプラットフォーム** - iOS/Android対応
- **リアルタイム更新** - プルトゥリフレッシュで最新データを取得

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAnon Keyを取得

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```bash
# .env.exampleをコピーして.envを作成
cp .env.example .env
```

`.env` ファイルに実際の値を設定：

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**注意**: `.env` ファイルは既に `.gitignore` に含まれているため、Gitにコミットされません。

### 4. Supabaseデータベースのセットアップ

1. SupabaseダッシュボードのSQL Editorを開く
2. `supabase_schema.sql` の内容をコピー＆ペーストして実行

これで以下のテーブルとポリシーが作成されます：
- `todos` テーブル
- Row Level Security (RLS) ポリシー
- インデックス（パフォーマンス最適化）

### 5. 認証設定

Supabaseダッシュボードで：
1. Authentication > Providers に移動
2. Email プロバイダーを有効化

### 6. アプリの起動

```bash
npm start
```

Expo GoアプリでQRコードをスキャンするか、エミュレータで起動します。

## プロジェクト構成

```
todo-app/
├── App.tsx                      # メインコンポーネント
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabaseクライアント設定
│   ├── theme/
│   │   └── colors.ts            # デザインシステム（カラー、シャドウ、スペーシング）
│   ├── types/
│   │   ├── todo.ts              # Todo型定義
│   │   └── graph.ts             # グラフデータ型定義
│   ├── store/
│   │   ├── authStore.ts         # 認証状態管理 (Zustand)
│   │   └── todoStore.ts         # Todo状態管理 (Zustand)
│   ├── screens/
│   │   └── AuthScreen.tsx       # ログイン/サインアップ画面
│   ├── components/
│   │   ├── AddTodo.tsx          # Todo追加コンポーネント
│   │   ├── TodoList.tsx         # Todoリストコンポーネント
│   │   └── ContributionGraph.tsx # 完了履歴グラフ
│   └── services/
│       └── todoService.ts       # グラフ用データ取得サービス
└── supabase_schema.sql          # データベーススキーマ
```

## デザインシステム

### カラーパレット

| 色 | 用途 |
|---|---|
| `#6366F1` ~ `#8B5CF6` | Primary (Indigo → Violet グラデーション) |
| `#10B981` | Success (Emerald) |
| `#F59E0B` | Warning (Amber) |
| `#F43F5E` | Danger (Rose) |
| `#F8FAFC` ~ `#0F172A` | Neutral (Slate) |

### UI特徴

- **グラデーション**: ボタンとロゴにIndigo→Violetのグラデーション
- **シャドウ**: 階層化されたシャドウシステム（sm/md/lg/primary）
- **アニメーション**: フェード、スライド、スケールアニメーション
- **ボーダーラジアス**: 統一された角丸（8px〜20px）

## テーブル設計

### todos テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | プライマリキー |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時（自動更新） |
| title | TEXT | Todoタイトル（1-500文字） |
| is_completed | BOOLEAN | 完了フラグ |
| completed_at | TIMESTAMP | 完了日時 |
| user_id | UUID | ユーザーID（外部キー） |
| priority | INTEGER | 優先度（0:低, 1:中, 2:高, 3:緊急） |
| due_date | TIMESTAMP | 期限日 |

### セキュリティ

- Row Level Security (RLS) が有効化されています
- ユーザーは自分のTodoのみアクセス可能
- すべての操作（SELECT, INSERT, UPDATE, DELETE）にポリシーが設定されています

### パフォーマンス

以下のインデックスが作成されています：
- `idx_todos_user_id`: ユーザーIDでの検索
- `idx_todos_user_completed`: ユーザーと完了状態での検索
- `idx_todos_user_created`: ユーザーと作成日時でのソート
- `idx_todos_completed_at`: 完了日時での検索（グラフ用）

## テスト

### テストの実行

```bash
# 全テストを実行
npm test

# ウォッチモードでテスト
npm run test:watch

# カバレッジレポート付きでテスト
npm run test:coverage
```

### テスト構成

| ファイル | 内容 |
|---------|------|
| `src/__tests__/validation.test.ts` | バリデーション関数のテスト |
| `src/__tests__/utils.test.ts` | ユーティリティ関数のテスト |

### 使用ライブラリ

- Jest - テストランナー
- ts-jest - TypeScriptサポート

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | Expo SDK 54, React Native, TypeScript |
| **状態管理** | Zustand |
| **バックエンド** | Supabase (PostgreSQL + Auth + RLS) |
| **UI** | React Native + expo-linear-gradient |
| **グラフ** | react-native-chart-kit |
| **アニメーション** | React Native Animated API |

## iOS ビルドと App Store 提出

### 前提条件

1. **Expo アカウント**: [expo.dev](https://expo.dev) でアカウント作成
2. **Apple Developer Account**: Apple Developer Program に登録（年間$99）
3. **App Store Connect**: App Store Connect でアプリを作成

### クイックスタート

```bash
# 1. EAS CLI にログイン
npm run eas:login

# 2. プロジェクト初期化（初回のみ）
npm run eas:init

# 3. 本番ビルド
npm run eas:build:ios

# 4. App Store に提出
npm run eas:submit:ios
```

### 詳細な手順

詳細は [EAS_SETUP.md](./EAS_SETUP.md) を参照してください。

### 必要な設定

1. **app.json**: `npx eas init` 実行後、`projectId` と `owner` が自動設定されます

## ライセンス

MIT License

---

**Made with using Expo & Supabase**

