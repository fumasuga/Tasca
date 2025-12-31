# Tasca - GitHub Pages

このディレクトリには、GitHub Pagesで公開するWebページが含まれています。

## ファイル構成

- `index.html` - トップページ
- `terms.html` - 利用規約
- `privacy.html` - プライバシーポリシー

## GitHub Pagesの設定方法

1. GitHubリポジトリのSettings → Pagesに移動
2. Sourceを「Deploy from a branch」に設定
3. Branchを「main」（または「master」）に設定
4. Folderを「/docs」に設定
5. Saveをクリック

## カスタマイズ

- 色やデザインを変更する場合は、各HTMLファイルの`<style>`セクションを編集してください
- コンテンツを変更する場合は、各HTMLファイルの本文を編集してください

## 問い合わせフォームの設定

問い合わせフォームは**FormSubmit**を使用しています。完全無料で、アカウント登録不要です。

### 設定方法

1. `index.html`の以下の行を編集：
   ```html
   <form id="contactForm" class="contact-form" action="https://formsubmit.co/YOUR_EMAIL@example.com" method="POST">
   ```
   `YOUR_EMAIL@example.com`を実際のメールアドレスに置き換えてください

2. これだけで完了です！FormSubmitが自動的にメールを送信します。

### FormSubmitの特徴

- ✅ **完全無料** - アカウント登録不要
- ✅ **設定が簡単** - メールアドレスを指定するだけ
- ✅ **スパム対策** - 自動的にスパムをフィルタリング
- ✅ **制限なし** - 送信回数に制限なし（無料プラン）

### カスタマイズ

FormSubmitには以下のオプションが利用できます（既に設定済み）：

- `_subject`: メールの件名
- `_captcha`: reCAPTCHAの有効/無効
- `_next`: 送信後のリダイレクト先URL
- `_template`: メールテンプレート（box, table, basic）

詳細は[FormSubmit公式サイト](https://formsubmit.co/)を参照してください。

