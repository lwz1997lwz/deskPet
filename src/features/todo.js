const fs = require('fs');
const path = require('path');

class TodoManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.todos = this.load();
    this.nextId = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
  }

  load() {
    try {
      if (fs.existsSync(this.dataPath)) {
        return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
      }
    } catch (e) {
      console.error('加载待办事项失败:', e);
    }
    return [];
  }

  save() {
    fs.writeFileSync(this.dataPath, JSON.stringify(this.todos, null, 2));
  }

  add(content, reminderTime = null) {
    const todo = {
      id: this.nextId++,
      content,
      reminderTime,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.todos.push(todo);
    this.save();
    return todo;
  }

  complete(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = true;
      this.save();
    }
  }

  remove(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }

  getPending() {
    return this.todos.filter(t => !t.completed);
  }

  getDueSoon(minutes = 5) {
    const now = new Date();
    const soon = new Date(now.getTime() + minutes * 60000);
    return this.todos.filter(t => {
      if (t.completed || !t.reminderTime) return false;
      const reminder = new Date(t.reminderTime);
      return reminder >= now && reminder <= soon;
    });
  }
}

module.exports = TodoManager;
