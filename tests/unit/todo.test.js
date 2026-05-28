const TodoManager = require('../../src/features/todo');
const fs = require('fs');
const path = require('path');

// 使用临时文件进行测试
const TEST_DATA_PATH = path.join(__dirname, '../temp-todos.json');

describe('TodoManager', () => {
  let todoManager;

  beforeEach(() => {
    // 清理测试文件
    if (fs.existsSync(TEST_DATA_PATH)) {
      fs.unlinkSync(TEST_DATA_PATH);
    }
    todoManager = new TodoManager(TEST_DATA_PATH);
  });

  afterEach(() => {
    // 清理测试文件
    if (fs.existsSync(TEST_DATA_PATH)) {
      fs.unlinkSync(TEST_DATA_PATH);
    }
  });

  describe('ID 生成', () => {
    test('连续 add() 应该生成不同的 ID', () => {
      const todo1 = todoManager.add('待办 1');
      const todo2 = todoManager.add('待办 2');
      const todo3 = todoManager.add('待办 3');

      expect(todo1.id).not.toBe(todo2.id);
      expect(todo2.id).not.toBe(todo3.id);
      expect(todo1.id).not.toBe(todo3.id);
    });

    test('ID 应该从 1 开始递增', () => {
      const todo1 = todoManager.add('待办 1');
      const todo2 = todoManager.add('待办 2');

      expect(todo1.id).toBe(1);
      expect(todo2.id).toBe(2);
    });

    test('从文件加载后 ID 计数器应该正确恢复', () => {
      // 添加一些待办事项
      todoManager.add('待办 1');
      todoManager.add('待办 2');
      todoManager.add('待办 3');

      // 创建新的 TodoManager 实例，从文件加载
      const newManager = new TodoManager(TEST_DATA_PATH);

      // 添加新的待办事项，ID 应该从 4 开始
      const todo4 = newManager.add('待办 4');
      expect(todo4.id).toBe(4);
    });

    test('删除再添加不会复用旧 ID', () => {
      const todo1 = todoManager.add('待办 1');
      const todo2 = todoManager.add('待办 2');

      // 删除待办 1
      todoManager.remove(todo1.id);

      // 添加新的待办事项，ID 应该是 3，而不是复用 1
      const todo3 = todoManager.add('待办 3');
      expect(todo3.id).toBe(3);
    });

    test('完成待办后 ID 计数器不受影响', () => {
      const todo1 = todoManager.add('待办 1');
      const todo2 = todoManager.add('待办 2');

      // 完成待办 1
      todoManager.complete(todo1.id);

      // 添加新的待办事项，ID 应该是 3
      const todo3 = todoManager.add('待办 3');
      expect(todo3.id).toBe(3);
    });
  });

  describe('基本功能', () => {
    test('应该添加待办事项', () => {
      const todo = todoManager.add('测试待办');
      expect(todo.content).toBe('测试待办');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
    });

    test('应该完成待办事项', () => {
      const todo = todoManager.add('测试待办');
      todoManager.complete(todo.id);

      const pending = todoManager.getPending();
      expect(pending.length).toBe(0);
    });

    test('应该删除待办事项', () => {
      const todo = todoManager.add('测试待办');
      todoManager.remove(todo.id);

      expect(todoManager.todos.length).toBe(0);
    });

    test('应该获取待办事项列表', () => {
      todoManager.add('待办 1');
      todoManager.add('待办 2');
      todoManager.add('待办 3');

      expect(todoManager.todos.length).toBe(3);
    });

    test('应该获取未完成的待办事项', () => {
      const todo1 = todoManager.add('待办 1');
      const todo2 = todoManager.add('待办 2');
      todoManager.add('待办 3');

      todoManager.complete(todo1.id);
      todoManager.complete(todo2.id);

      const pending = todoManager.getPending();
      expect(pending.length).toBe(1);
      expect(pending[0].content).toBe('待办 3');
    });
  });

  describe('提醒功能', () => {
    test('应该获取即将到期的待办事项', () => {
      const now = new Date();
      const soon = new Date(now.getTime() + 3 * 60000); // 3 分钟后
      const later = new Date(now.getTime() + 10 * 60000); // 10 分钟后

      todoManager.add('即将到期', soon.toISOString());
      todoManager.add('稍后到期', later.toISOString());

      const dueSoon = todoManager.getDueSoon(5); // 5 分钟内到期
      expect(dueSoon.length).toBe(1);
      expect(dueSoon[0].content).toBe('即将到期');
    });

    test('应该忽略已完成的待办事项', () => {
      const now = new Date();
      const soon = new Date(now.getTime() + 3 * 60000);

      const todo = todoManager.add('即将到期', soon.toISOString());
      todoManager.complete(todo.id);

      const dueSoon = todoManager.getDueSoon(5);
      expect(dueSoon.length).toBe(0);
    });

    test('应该忽略没有提醒时间的待办事项', () => {
      todoManager.add('没有提醒时间');

      const dueSoon = todoManager.getDueSoon(5);
      expect(dueSoon.length).toBe(0);
    });
  });
});
