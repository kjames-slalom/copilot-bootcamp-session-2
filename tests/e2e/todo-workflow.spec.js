const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo Workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should display the app header and add task form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'To Do App' })).toBeVisible();
    await expect(page.getByText('Keep track of your tasks')).toBeVisible();
    await expect(todoPage.taskInput).toBeVisible();
    await expect(todoPage.addButton).toBeVisible();
  });

  test('should add a new task', async ({ page }) => {
    const name = `E2E Task ${Date.now()}`;
    await todoPage.addTodo(name);
    await expect(page.getByText(name)).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    const name = `Delete Me ${Date.now()}`;
    await todoPage.addTodo(name);
    await expect(page.getByText(name)).toBeVisible();

    await todoPage.deleteTodo(name);
    await expect(page.getByText(name)).not.toBeVisible();
  });

  test('should mark a task as complete', async ({ page }) => {
    const name = `Complete Me ${Date.now()}`;
    await todoPage.addTodo(name);

    await todoPage.toggleComplete(name);

    const todoText = page.getByText(name, { exact: true });
    await expect(todoText).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('should edit a task name', async ({ page }) => {
    const original = `Edit Me ${Date.now()}`;
    const updated = `Edited ${Date.now()}`;
    await todoPage.addTodo(original);

    await todoPage.editTodo(original, updated);

    await expect(page.getByText(updated)).toBeVisible();
    await expect(page.getByText(original)).not.toBeVisible();
  });

  test('should cancel editing without saving', async ({ page }) => {
    const name = `Cancel Edit ${Date.now()}`;
    await todoPage.addTodo(name);

    await todoPage.cancelEdit(name);

    await expect(page.getByText(name)).toBeVisible();
  });

  test('should not show empty state when tasks exist', async ({ page }) => {
    // The backend always seeds known todos on startup
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('No todos found. Add some!')).not.toBeVisible();
  });
});
