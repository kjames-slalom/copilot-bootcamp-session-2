const request = require('supertest');

// Import a fresh module instance for integration tests to avoid shared state
let app;
let db;

beforeAll(() => {
  jest.resetModules();
  const module = require('../../src/app');
  app = module.app;
  db = module.db;
});

afterAll(() => {
  if (db) db.close();
});

beforeEach(() => {
  // Clear all todos and re-seed with known state before each test
  db.exec('DELETE FROM todos');
});

describe('Todos API Integration Tests', () => {
  describe('GET /api/todos', () => {
    it('should return an empty array when there are no todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return todos sorted by creation time ascending', async () => {
      await request(app).post('/api/todos').send({ name: 'First' });
      await request(app).post('/api/todos').send({ name: 'Second' });
      await request(app).post('/api/todos').send({ name: 'Third' });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body.map(t => t.name)).toEqual(['First', 'Second', 'Third']);
    });

    it('should return todos with id, name, completed, and created_at fields', async () => {
      await request(app).post('/api/todos').send({ name: 'Check fields' });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      const todo = response.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('name', 'Check fields');
      expect(todo).toHaveProperty('completed', false);
      expect(todo).toHaveProperty('created_at');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a todo and return it with completed=false', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: 'Buy milk' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Buy milk');
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('id');
    });

    it('created todo should appear in GET /api/todos', async () => {
      await request(app).post('/api/todos').send({ name: 'Persisted todo' });

      const getResponse = await request(app).get('/api/todos');
      const names = getResponse.body.map(t => t.name);
      expect(names).toContain('Persisted todo');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app).post('/api/todos').send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 for whitespace-only name', async () => {
      const response = await request(app).post('/api/todos').send({ name: '   ' });
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update the todo name', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Old Name' })).body;

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New Name');
      expect(response.body.completed).toBe(false);
    });

    it('should mark a todo as complete', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Do laundry' })).body;

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('should mark a completed todo as incomplete', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Do laundry' })).body;
      await request(app).put(`/api/todos/${created.id}`).send({ completed: true });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: false });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
    });

    it('should update both name and completed in one request', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Original' })).body;

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ name: 'Updated', completed: true });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated');
      expect(response.body.completed).toBe(true);
    });

    it('should return 404 for a non-existent todo', async () => {
      const response = await request(app).put('/api/todos/99999').send({ name: 'Ghost' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo and return success', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'To delete' })).body;

      const response = await request(app).delete(`/api/todos/${created.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Todo deleted successfully', id: created.id });
    });

    it('deleted todo should not appear in GET /api/todos', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Gone soon' })).body;
      await request(app).delete(`/api/todos/${created.id}`);

      const getResponse = await request(app).get('/api/todos');
      const ids = getResponse.body.map(t => t.id);
      expect(ids).not.toContain(created.id);
    });

    it('should return 404 when deleting a non-existent todo', async () => {
      const response = await request(app).delete('/api/todos/99999');
      expect(response.status).toBe(404);
    });

    it('should return 404 on second delete of same todo', async () => {
      const created = (await request(app).post('/api/todos').send({ name: 'Delete twice' })).body;
      await request(app).delete(`/api/todos/${created.id}`);

      const response = await request(app).delete(`/api/todos/${created.id}`);
      expect(response.status).toBe(404);
    });
  });
});
