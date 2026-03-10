import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const mockTodos = [
  { id: 1, name: 'Test Todo 1', completed: false, created_at: '2023-01-01T00:00:00.000Z' },
  { id: 2, name: 'Test Todo 2', completed: false, created_at: '2023-01-02T00:00:00.000Z' },
];

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTodos));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo name is required' }));
    }
    return res(
      ctx.status(201),
      ctx.json({ id: 3, name, completed: false, created_at: new Date().toISOString() })
    );
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { name, completed } = req.body;
    const todo = mockTodos.find(t => t.id === parseInt(id));
    if (!todo) return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    return res(
      ctx.status(200),
      ctx.json({
        ...todo,
        name: name !== undefined ? name : todo.name,
        completed: completed !== undefined ? completed : todo.completed,
      })
    );
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id: parseInt(id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter task name');
    await act(async () => {
      await user.type(input, 'New Test Todo');
    });

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Todo')).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete task "test todo 1"/i });
    await act(async () => {
      await user.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    });
  });

  test('toggles a todo as complete', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "test todo 1" as complete/i,
    });
    await act(async () => {
      await user.click(checkbox);
    });

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  test('edits a todo name', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task "test todo 1"/i });
    await act(async () => {
      await user.click(editButton);
    });

    const editInput = screen.getByRole('textbox', { name: /edit task name/i });
    await act(async () => {
      await user.clear(editInput);
      await user.type(editInput, 'Updated Todo 1');
    });

    const saveButton = screen.getByRole('button', { name: /save task/i });
    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Todo 1')).toBeInTheDocument();
    });
  });

  test('cancels editing a todo', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task "test todo 1"/i });
    await act(async () => {
      await user.click(editButton);
    });

    const cancelButton = screen.getByRole('button', { name: /cancel edit/i });
    await act(async () => {
      await user.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
  });

  test('handles API error on fetch', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch todos/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos found. Add some!')).toBeInTheDocument();
    });
  });
});
