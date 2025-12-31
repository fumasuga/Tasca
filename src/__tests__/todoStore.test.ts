import { useTodoStore } from '../store/todoStore';

// Mock Alert first
const mockAlert = jest.fn();
jest.mock('react-native', () => ({
  Alert: {
    alert: (...args: any[]) => mockAlert(...args),
  },
}));

// Mock Supabase
const mockGetSupabase = jest.fn();
jest.mock('../lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(() => true),
  getSupabase: () => mockGetSupabase(),
}));

describe('useTodoStore', () => {
  const mockTranslation = (key: string) => key;

  beforeEach(() => {
    // Reset store state
    useTodoStore.setState({ todos: [], loading: false });
    mockAlert.mockClear();
    mockGetSupabase.mockClear();
    
    // Setup default mock
    mockGetSupabase.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'new-todo-id',
                title: 'Test todo',
                is_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed_at: null,
                user_id: 'test-user-id',
                priority: 0,
                output: null,
                url: null,
              }, 
              error: null 
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ 
          data: { user: { id: 'test-user-id' } }, 
          error: null 
        })),
      },
    });
  });

  describe('fetchTodos', () => {
    it('should fetch todos successfully', async () => {
      const { fetchTodos } = useTodoStore.getState();
      
      await fetchTodos(mockTranslation);
      
      expect(useTodoStore.getState().loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockGetSupabase.mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Network error' } 
            })),
          })),
        })),
      });

      const { fetchTodos } = useTodoStore.getState();
      
      await fetchTodos(mockTranslation);
      
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  describe('addTodo', () => {
    it('should reject empty title', async () => {
      const { addTodo } = useTodoStore.getState();
      
      await addTodo('', mockTranslation);
      
      expect(mockAlert).toHaveBeenCalled();
    });

    it('should reject title that is too long', async () => {
      const { addTodo } = useTodoStore.getState();
      const longTitle = 'a'.repeat(501);
      
      await addTodo(longTitle, mockTranslation);
      
      expect(mockAlert).toHaveBeenCalled();
    });

    it('should add todo with valid title', async () => {
      const { addTodo } = useTodoStore.getState();
      
      await addTodo('Test todo', mockTranslation);
      
      // Verify that Supabase was called
      expect(mockGetSupabase).toHaveBeenCalled();
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status optimistically', async () => {
      const testTodo = {
        id: 'test-id',
        title: 'Test todo',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        user_id: 'test-user-id',
        priority: 0,
        output: null,
        url: null,
      };

      useTodoStore.setState({ todos: [testTodo] });

      const { toggleTodo } = useTodoStore.getState();
      
      await toggleTodo('test-id', false, mockTranslation);
      
      const updatedTodo = useTodoStore.getState().todos.find(t => t.id === 'test-id');
      expect(updatedTodo?.is_completed).toBe(true);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo from state optimistically', async () => {
      const testTodo = {
        id: 'test-id',
        title: 'Test todo',
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        user_id: 'test-user-id',
        priority: 0,
        output: null,
        url: null,
      };

      useTodoStore.setState({ todos: [testTodo] });

      const { deleteTodo } = useTodoStore.getState();
      
      await deleteTodo('test-id', mockTranslation);
      
      const todos = useTodoStore.getState().todos;
      expect(todos.find(t => t.id === 'test-id')).toBeUndefined();
    });
  });
});
