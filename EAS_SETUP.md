# EAS CLI による iOS ビルドと App Store 提出ガイド

## 📋 前提条件

1. **Expo アカウント**: [expo.dev](https://expo.dev) でアカウント作成
2. **Apple Developer Account**: Apple Developer Program に登録（年間$99）
3. **App Store Connect**: App Store Connect でアプリを作成済み

---

## 🔧 セットアップ手順

### 1. EAS CLI のログイン

```bash
npx eas login
```

または、ローカルにインストールした場合：

```bash
npm run eas:login
```

### 2. プロジェクトの初期化

```bash
npx eas init
```

このコマンドで：
- Expo プロジェクトが作成されます
- `app.json` の `extra.eas.projectId` が自動設定されます
- `app.json` の `owner` が自動設定されます

### 3. app.json の確認

`npx eas init` 実行後、`app.json` の以下を確認：

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // ← 自動設定される
      }
    },
    "owner": "your-expo-username"  // ← 自動設定される
  }
}
```


## 🏗️ ビルド手順

### 開発ビルド（シミュレーター用）

```bash
npx eas build --platform ios --profile development
```

### プレビュービルド（内部テスト用・実機）

```bash
npx eas build --platform ios --profile preview
```

### 本番ビルド（App Store提出用）

```bash
npx eas build --platform ios --profile production
```

**初回ビルド時：**
- Apple Developer の認証情報を求められます
- 証明書とプロビジョニングプロファイルが自動生成されます

---

## 📤 App Store への提出

### 0. App Store Connect で新規アプリを作成（初回のみ）

**重要**: 新しいアプリ名「Tasca」で新規アプリとして登録する必要があります。

1. **App Store Connect にログイン**
   - https://appstoreconnect.apple.com にアクセス
   - Apple Developerアカウントでログイン

2. **新規アプリの作成**
   - 「マイApp」→「+」→「新しいApp」をクリック
   - 以下の情報を入力：
     - **プラットフォーム**: iOS
     - **名前**: Tasca
     - **プライマリ言語**: 日本語（または英語）
     - **Bundle ID**: `com.fumasuga.tasca.app`（既存のBundle IDを選択、または新規作成）
     - **SKU**: `tasca-001`（任意の識別子）
   - 「作成」をクリック

3. **Bundle ID の新規作成（必要な場合）**
   - Apple Developer Portal → Certificates, Identifiers & Profiles → Identifiers
   - 「+」をクリックして新しいApp IDを作成
   - **Description**: Tasca
   - **Bundle ID**: `com.fumasuga.tasca.app`
   - **Capabilities**: 必要に応じて設定（Push Notifications等）

### 1. App Store Connect での準備

1. **アプリ情報の入力**
   - アプリ名: Tasca
   - 説明文（日本語・英語）
   - カテゴリ: Productivity
   - キーワード
   - プライバシーポリシーURL（必須）
   - サポートURL（必須）

2. **スクリーンショットの準備**
   - iPhone 6.5インチ（iPhone 14 Pro Max）
   - iPhone 5.5インチ（iPhone 8 Plus）
   - 各サイズで必要な枚数を用意

3. **アプリのバージョン情報**
   - バージョン: 1.0.0
   - ビルド番号: 1（自動インクリメント設定済み）

### 2. ビルドの提出

```bash
npx eas submit --platform ios
```

このコマンドで：
- 最新の production ビルドが自動的に検出されます
- App Store Connect にアップロードされます
- 審査待ちの状態になります

---

## 🔍 ビルド状態の確認

### ビルド一覧の確認

```bash
npx eas build:list
```

### 特定のビルドの詳細確認

```bash
npx eas build:view [BUILD_ID]
```

### ビルドログの確認

EAS Dashboard: https://expo.dev/accounts/[your-username]/projects/tasca/builds

---

## ⚙️ 環境変数の設定

本番ビルドに環境変数を含める場合：

```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

または、`eas.json` に追加：

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

⚠️ **注意**: 機密情報は `eas secret` を使用することを推奨

---

## 📝 チェックリスト

### ビルド前
- [ ] `app.json` の `projectId` と `owner` が設定されている
- [ ] `eas.json` の提出設定が完了している
- [ ] アイコンが正しく配置されている（`assets/icon.png`）
- [ ] スプラッシュスクリーンが設定されている
- [ ] バージョン番号が正しい（`app.json` の `version`）

### 提出前
- [ ] App Store Connect でアプリ情報が入力されている
- [ ] スクリーンショットが準備されている
- [ ] プライバシーポリシーが公開されている
- [ ] サポートURLが設定されている
- [ ] アプリの動作確認が完了している

---

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# ビルドログを確認
npx eas build:view [BUILD_ID] --json

# クリーンビルド
npx eas build --platform ios --profile production --clear-cache
```

### 証明書エラー

```bash
# 証明書を再生成
npx eas credentials
```

### 提出エラー

- App Store Connect の API Key を使用する場合：
  ```bash
  npx eas submit --platform ios --apple-api-key-id [KEY_ID] --apple-api-issuer [ISSUER_ID]
  ```

---

## 📚 参考リンク

- [EAS Build ドキュメント](https://docs.expo.dev/build/introduction/)
- [EAS Submit ドキュメント](https://docs.expo.dev/submit/introduction/)
- [App Store Connect ガイド](https://developer.apple.com/app-store-connect/)

---

## 🚀 クイックスタート

```bash
# 1. ログイン
npx eas login

# 2. プロジェクト初期化
npx eas init

# 3. 本番ビルド
npx eas build --platform ios --profile production

# 4. App Store に提出
npx eas submit --platform ios
```

### Apple Developer Portal 認証エラー

**エラー: "Verification codes can't be sent to this phone number"**

Appleの2FA SMS認証で問題が発生した場合、以下の対処法を試してください：

#### 解決策1: App Store Connect API Key を使用（推奨）

1. **App Store Connect で API Key を作成**
   - App Store Connect → Users and Access → Keys
   - 「Generate API Key」をクリック
   - Key Name を入力（例: "EAS Build Key"）
   - Access: "App Manager" または "Admin" を選択
   - ダウンロードした `.p8` ファイルを安全に保管

2. **EAS に API Key を設定**
   npx eas credentials
      メニューから「iOS」→「Set up App Store Connect API Key」を選択

3. **ビルド時に API Key を使用**
  
   npx eas build --platform ios --profile production
   #### 解決策2: 認証を再試行

- 時間を置いてから再度試行
- 別のネットワーク環境から試行
- Apple Developer Portal に直接ログインして認証状態を確認

#### 解決策3: 既存の証明書を使用

既に証明書がある場合：
npx eas credentialsメニューから「Use existing credentials」を選択

#### 参考リンク

- [Apple 2FA SMS Issues Workaround](https://expo.fyi/apple-2fa-sms-issues-workaround.md)
- [App Store Connect API Keys](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)