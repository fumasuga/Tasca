import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateTodoTitle,
  validateUrl,
  validateOutput,
  sanitizeInput,
} from '../utils/validation';

describe('validateEmail', () => {
  it('should return valid for correct email format', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('メールアドレスを入力してください');
  });

  it('should return invalid for email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('メールアドレスの形式が正しくありません');
  });

  it('should return invalid for email without domain', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('メールアドレスの形式が正しくありません');
  });

  it('should trim whitespace', () => {
    const result = validateEmail('  test@example.com  ');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for very long email', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    const result = validateEmail(longEmail);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('メールアドレスが長すぎます');
  });
});

describe('validatePassword', () => {
  it('should return valid for password with 6+ characters', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('パスワードを入力してください');
  });

  it('should return invalid for password less than 6 characters', () => {
    const result = validatePassword('12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('パスワードは6文字以上で入力してください');
  });

  it('should return valid for exactly 6 characters', () => {
    const result = validatePassword('123456');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for password over 72 characters', () => {
    const result = validatePassword('a'.repeat(73));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('パスワードは72文字以内で入力してください');
  });
});

describe('validatePasswordConfirm', () => {
  it('should return valid when passwords match', () => {
    const result = validatePasswordConfirm('password123', 'password123');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for empty confirm', () => {
    const result = validatePasswordConfirm('password123', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('パスワード確認を入力してください');
  });

  it('should return invalid when passwords do not match', () => {
    const result = validatePasswordConfirm('password123', 'password456');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('パスワードが一致しません');
  });
});

describe('validateTodoTitle', () => {
  it('should return valid for normal title', () => {
    const result = validateTodoTitle('Buy groceries');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for empty title', () => {
    const result = validateTodoTitle('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('タスクを入力してください');
  });

  it('should return invalid for whitespace only', () => {
    const result = validateTodoTitle('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('タスクを入力してください');
  });

  it('should return invalid for title over 500 characters', () => {
    const result = validateTodoTitle('a'.repeat(501));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('タスクは500文字以内で入力してください');
  });

  it('should return valid for exactly 500 characters', () => {
    const result = validateTodoTitle('a'.repeat(500));
    expect(result.isValid).toBe(true);
  });
});

describe('validateUrl', () => {
  it('should return valid for empty URL (optional field)', () => {
    const result = validateUrl('');
    expect(result.isValid).toBe(true);
  });

  it('should return valid for https URL', () => {
    const result = validateUrl('https://example.com');
    expect(result.isValid).toBe(true);
  });

  it('should return valid for http URL', () => {
    const result = validateUrl('http://example.com');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for URL without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URLの形式が正しくありません');
  });

  it('should return invalid for ftp URL', () => {
    const result = validateUrl('ftp://example.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URLはhttp://またはhttps://で始まる必要があります');
  });

  it('should return invalid for URL over 2000 characters', () => {
    const result = validateUrl('https://example.com/' + 'a'.repeat(2000));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URLは2000文字以内で入力してください');
  });
});

describe('validateOutput', () => {
  it('should return valid for empty output (optional field)', () => {
    const result = validateOutput('');
    expect(result.isValid).toBe(true);
  });

  it('should return valid for normal output', () => {
    const result = validateOutput('Learned a lot today!');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for output over 10000 characters', () => {
    const result = validateOutput('a'.repeat(10001));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('アウトプットは10000文字以内で入力してください');
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should escape quotes', () => {
    const result = sanitizeInput("It's a \"test\"");
    expect(result).toBe("It&#039;s a &quot;test&quot;");
  });

  it('should not modify safe text', () => {
    const result = sanitizeInput('Hello World');
    expect(result).toBe('Hello World');
  });
});

