import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const theme = createTheme({
  palette: {
    primary: { main: '#3F51B5' },
    secondary: { main: '#03A9F4' },
    background: { default: '#FFFFFF' },
  },
});

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTodo }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      const result = await response.json();
      setTodos([...todos, result]);
      setNewTodo('');
      setError(null);
    } catch (err) {
      setError('Error adding todo: ' + err.message);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
      setError(null);
    } catch (err) {
      setError('Error updating todo: ' + err.message);
    }
  };

  const handleEditStart = (todo) => {
    setEditingId(todo.id);
    setEditingName(todo.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSave = async (id) => {
    if (!editingName.trim()) return;
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
      setEditingId(null);
      setEditingName('');
      setError(null);
    } catch (err) {
      setError('Error updating todo: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Error deleting todo: ' + err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="sm">
          <Typography variant="h4" component="h1" align="center" color="primary" fontWeight="bold" gutterBottom>
            To Do App
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Keep track of your tasks
          </Typography>

          <Card sx={{ mb: 3, borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add New Task</Typography>
              <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Enter task name"
                  inputProps={{ 'aria-label': 'New task name' }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                >
                  Add Task
                </Button>
              </Box>
            </CardContent>
          </Card>

          {error && (
            <Typography color="error" role="alert" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Card sx={{ borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Tasks</Typography>
              {loading && <Typography>Loading data...</Typography>}
              {!loading && todos.length === 0 && (
                <Typography color="text.secondary">No todos found. Add some!</Typography>
              )}
              <List disablePadding>
                {todos.map((todo) => (
                  <ListItem
                    key={todo.id}
                    disableGutters
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                      opacity: todo.completed ? 0.6 : 1,
                    }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      color="primary"
                      inputProps={{ 'aria-label': `Mark "${todo.name}" as ${todo.completed ? 'incomplete' : 'complete'}` }}
                      sx={{ minWidth: 44, minHeight: 44 }}
                    />
                    {editingId === todo.id ? (
                      <>
                        <TextField
                          size="small"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(todo.id);
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          inputProps={{ 'aria-label': 'Edit task name' }}
                          sx={{ flex: 1 }}
                          autoFocus
                        />
                        <IconButton
                          onClick={() => handleEditSave(todo.id)}
                          color="primary"
                          aria-label="Save task"
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleEditCancel}
                          aria-label="Cancel edit"
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            flex: 1,
                            fontSize: '1rem',
                            fontWeight: 500,
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {todo.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleEditStart(todo)}
                          color="secondary"
                          aria-label={`Edit task "${todo.name}"`}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(todo.id)}
                          color="error"
                          aria-label={`Delete task "${todo.name}"`}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;