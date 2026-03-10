const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTodos = ['Buy groceries', 'Walk the dog', 'Read a book'];
const insertStmt = db.prepare('INSERT INTO todos (name) VALUES (?)');

initialTodos.forEach(todo => {
  insertStmt.run(todo);
});

console.log('In-memory database initialized with sample data');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY created_at ASC').all();
    res.json(todos.map(t => ({ ...t, completed: t.completed === 1 })));
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Todo name is required' });
    }

    const result = insertStmt.run(name.trim());
    const id = result.lastInsertRowid;

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.status(201).json({ ...newTodo, completed: newTodo.completed === 1 });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { name, completed } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Todo name must be a non-empty string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }

    const newName = name !== undefined ? name.trim() : existing.name;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    db.prepare('UPDATE todos SET name = ?, completed = ? WHERE id = ?').run(newName, newCompleted, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json({ ...updated, completed: updated.completed === 1 });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db, insertStmt };