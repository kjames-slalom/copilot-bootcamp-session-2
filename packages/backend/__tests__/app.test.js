const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTodo = async (name = 'Temp Todo') => {
  const response = await request(app)
    .post('/api/todos')
    .send({ name })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const todo = response.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('name');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('created_at');
    });

    it('should return todos with boolean completed field', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      response.body.forEach(todo => {
        expect(typeof todo.completed).toBe('boolean');
      });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = { name: 'Test Todo' };
      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newTodo.name);
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo name is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update the name of an existing todo', async () => {
      const todo = await createTodo('Original Name');

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.id).toBe(todo.id);
    });

    it('should toggle completed to true', async () => {
      const todo = await createTodo('Todo to complete');

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ completed: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('should toggle completed back to false', async () => {
      const todo = await createTodo('Todo to uncomplete');
      await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ completed: false })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
    });

    it('should return 404 when todo does not exist', async () => {
      const response = await request(app)
        .put('/api/todos/999999')
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .put('/api/todos/abc')
        .send({ name: 'New Name' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid todo ID is required');
    });

    it('should return 400 if name is empty string', async () => {
      const todo = await createTodo('Valid Todo');

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Todo name must be a non-empty string');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = await createTodo('Todo To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

      const deleteAgain = await request(app).delete(`/api/todos/${todo.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 404 when todo does not exist', async () => {
      const response = await request(app).delete('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/todos/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid todo ID is required');
    });
  });
});
