/**
 * バリデーションユーティリティ
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'メールアドレスを入力してください' };
  }
  
  // 基本的なメールアドレスの形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'メールアドレスの形式が正しくありません' };
  }
  
  // 長さチェック
  if (trimmed.length > 254) {
    return { isValid: false, error: 'メールアドレスが長すぎます' };
  }
  
  return { isValid: true };
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'パスワードを入力してください' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'パスワードは6文字以上で入力してください' };
  }
  
  if (password.length > 72) {
    return { isValid: false, error: 'パスワードは72文字以内で入力してください' };
  }
  
  return { isValid: true };
}

/**
 * パスワード確認のバリデーション
 */
export function validatePasswordConfirm(password: string, confirm: string): ValidationResult {
  if (!confirm) {
    return { isValid: false, error: 'パスワード確認を入力してください' };
  }
  
  if (password !== confirm) {
    return { isValid: false, error: 'パスワードが一致しません' };
  }
  
  return { isValid: true };
}

/**
 * Todoタイトルのバリデーション
 */
export function validateTodoTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'タスクを入力してください' };
  }
  
  if (trimmed.length > 500) {
    return { isValid: false, error: 'タスクは500文字以内で入力してください' };
  }
  
  return { isValid: true };
}

/**
 * URLのバリデーション
 */
export function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();
  
  // 空の場合は有効（オプショナルフィールド）
  if (!trimmed) {
    return { isValid: true };
  }
  
  // 長さチェック
  if (trimmed.length > 2000) {
    return { isValid: false, error: 'URLは2000文字以内で入力してください' };
  }
  
  // URL形式チェック
  try {
    const urlObj = new URL(trimmed);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URLはhttp://またはhttps://で始まる必要があります' };
    }
  } catch {
    return { isValid: false, error: 'URLの形式が正しくありません' };
  }
  
  return { isValid: true };
}

/**
 * アウトプットテキストのバリデーション
 */
export function validateOutput(output: string): ValidationResult {
  // 空の場合は有効（オプショナルフィールド）
  if (!output) {
    return { isValid: true };
  }
  
  // 長さチェック（10000文字まで）
  if (output.length > 10000) {
    return { isValid: false, error: 'アウトプットは10000文字以内で入力してください' };
  }
  
  return { isValid: true };
}

/**
 * XSS対策: HTMLタグのサニタイズ
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

