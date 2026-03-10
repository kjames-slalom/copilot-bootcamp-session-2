class TodoPage {
  constructor(page) {
    this.page = page;
    this.taskInput = page.getByPlaceholder('Enter task name');
    this.addButton = page.getByRole('button', { name: /add task/i });
    this.taskList = page.getByRole('list');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async addTodo(name) {
    await this.taskInput.fill(name);
    await this.addButton.click();
    await this.page.getByText(name).waitFor({ state: 'visible' });
  }

  async deleteTodo(name) {
    await this.page.getByRole('button', { name: `Delete task "${name}"` }).click();
    await this.page.getByText(name).waitFor({ state: 'hidden' });
  }

  async toggleComplete(name) {
    await this.page
      .getByRole('checkbox', { name: new RegExp(`mark "${name}" as`, 'i') })
      .click();
  }

  async editTodo(currentName, newName) {
    await this.page.getByRole('button', { name: `Edit task "${currentName}"` }).click();
    const editInput = this.page.getByRole('textbox', { name: /edit task name/i });
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.getByRole('button', { name: /save task/i }).click();
    await this.page.getByText(newName).waitFor({ state: 'visible' });
  }

  async cancelEdit(name) {
    await this.page.getByRole('button', { name: `Edit task "${name}"` }).click();
    await this.page.getByRole('button', { name: /cancel edit/i }).click();
  }

  async getTodoNames() {
    await this.page.waitForLoadState('networkidle');
    return this.page.locator('[role="list"] [role="listitem"]').allTextContents();
  }

  async isTodoComplete(name) {
    const checkbox = this.page.getByRole('checkbox', {
      name: new RegExp(`mark "${name}" as`, 'i'),
    });
    return checkbox.isChecked();
  }
}

module.exports = { TodoPage };
