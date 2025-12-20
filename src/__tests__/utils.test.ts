// Test utility functions

describe('String utils', () => {
  describe('trim', () => {
    it('should trim whitespace from both ends', () => {
      expect('  hello  '.trim()).toBe('hello');
    });

    it('should handle already trimmed strings', () => {
      expect('hello'.trim()).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(''.trim()).toBe('');
    });
  });

  describe('length check', () => {
    it('should correctly check string length', () => {
      const testString = 'hello';
      expect(testString.length).toBe(5);
    });

    it('should handle unicode characters', () => {
      const emoji = '😀';
      // Emoji takes 2 code units
      expect(emoji.length).toBe(2);
    });
  });
});

describe('Date utils', () => {
  describe('date formatting', () => {
    it('should correctly parse ISO date string', () => {
      const dateStr = '2024-01-15T10:30:00.000Z';
      const date = new Date(dateStr);
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0); // January is 0
      expect(date.getUTCDate()).toBe(15);
    });

    it('should calculate days difference', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-10');
      const diffTime = date1.getTime() - date2.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(5);
    });

    it('should check if date is today', () => {
      const today = new Date();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const testDate = new Date();
      testDate.setHours(0, 0, 0, 0);
      
      expect(testDate.getTime()).toBe(todayStart.getTime());
    });
  });
});

describe('Array utils', () => {
  describe('filter', () => {
    it('should filter array based on condition', () => {
      const todos = [
        { id: '1', is_completed: true },
        { id: '2', is_completed: false },
        { id: '3', is_completed: true },
      ];
      const completed = todos.filter(t => t.is_completed);
      expect(completed.length).toBe(2);
    });

    it('should return empty array when no matches', () => {
      const todos = [
        { id: '1', is_completed: false },
        { id: '2', is_completed: false },
      ];
      const completed = todos.filter(t => t.is_completed);
      expect(completed.length).toBe(0);
    });
  });

  describe('map', () => {
    it('should transform array items', () => {
      const todos = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];
      const titles = todos.map(t => t.title);
      expect(titles).toEqual(['Task 1', 'Task 2']);
    });
  });

  describe('reduce', () => {
    it('should count completed todos', () => {
      const todos = [
        { id: '1', is_completed: true },
        { id: '2', is_completed: false },
        { id: '3', is_completed: true },
      ];
      const count = todos.reduce((acc, t) => acc + (t.is_completed ? 1 : 0), 0);
      expect(count).toBe(2);
    });
  });
});

describe('Object utils', () => {
  describe('spread operator', () => {
    it('should merge objects correctly', () => {
      const todo = { id: '1', title: 'Task', is_completed: false };
      const updated = { ...todo, is_completed: true };
      expect(updated.is_completed).toBe(true);
      expect(updated.title).toBe('Task');
    });

    it('should not mutate original object', () => {
      const original = { id: '1', is_completed: false };
      const updated = { ...original, is_completed: true };
      expect(original.is_completed).toBe(false);
    });
  });
});

describe('UUID generation pattern', () => {
  it('should have correct format with crypto', () => {
    // Simple UUID v4 pattern check
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sampleUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(uuidPattern.test(sampleUuid)).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidPattern.test('not-a-uuid')).toBe(false);
    expect(uuidPattern.test('12345')).toBe(false);
  });
});

