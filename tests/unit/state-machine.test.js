const StateMachine = require('../../src/cat/state-machine');

describe('StateMachine', () => {
  let sm;

  beforeEach(() => {
    sm = new StateMachine();
  });

  describe('addState', () => {
    test('应该添加状态', () => {
      sm.addState('idle', { onEnter: jest.fn(), onUpdate: jest.fn() });
      expect(sm.states.idle).toBeDefined();
    });

    test('应该验证状态名称参数', () => {
      expect(() => sm.addState('', {})).toThrow('状态名称必须是非空字符串');
      expect(() => sm.addState(null, {})).toThrow('状态名称必须是非空字符串');
      expect(() => sm.addState(123, {})).toThrow('状态名称必须是非空字符串');
    });

    test('应该验证状态配置参数', () => {
      expect(() => sm.addState('idle', null)).toThrow('状态配置必须是对象');
      expect(() => sm.addState('idle', 'invalid')).toThrow('状态配置必须是对象');
      expect(() => sm.addState('idle', undefined)).toThrow('状态配置必须是对象');
    });
  });

  describe('transition', () => {
    test('应该转换状态', () => {
      const walkOnEnter = jest.fn();
      sm.addState('idle', { onEnter: jest.fn(), onUpdate: jest.fn() });
      sm.addState('walk', { onEnter: walkOnEnter, onUpdate: jest.fn() });
      sm.transition('walk');
      expect(sm.currentState).toBe('walk');
      expect(walkOnEnter).toHaveBeenCalled();
    });

    test('应该调用 onEnter', () => {
      const onEnter = jest.fn();
      sm.addState('idle', { onEnter, onUpdate: jest.fn() });
      sm.transition('idle');
      expect(onEnter).toHaveBeenCalled();
    });

    test('应该调用 onExit 回调', () => {
      const idleOnExit = jest.fn();
      const walkOnEnter = jest.fn();
      sm.addState('idle', { onEnter: jest.fn(), onExit: idleOnExit });
      sm.addState('walk', { onEnter: walkOnEnter });
      sm.transition('idle');
      sm.transition('walk');
      expect(idleOnExit).toHaveBeenCalled();
      expect(walkOnEnter).toHaveBeenCalled();
    });

    test('转换到不存在的状态应该无效', () => {
      sm.addState('idle', { onEnter: jest.fn() });
      sm.transition('nonexistent');
      expect(sm.currentState).toBeNull();
    });

    test('初始状态为 null 时应该正常工作', () => {
      sm.addState('idle', { onEnter: jest.fn() });
      expect(sm.currentState).toBeNull();
      sm.transition('idle');
      expect(sm.currentState).toBe('idle');
    });

    test('应该支持连续多次状态转换', () => {
      const idleOnExit = jest.fn();
      const walkOnExit = jest.fn();
      const runOnEnter = jest.fn();
      sm.addState('idle', { onEnter: jest.fn(), onExit: idleOnExit });
      sm.addState('walk', { onEnter: jest.fn(), onExit: walkOnExit });
      sm.addState('run', { onEnter: runOnEnter });
      sm.transition('idle');
      sm.transition('walk');
      sm.transition('run');
      expect(sm.currentState).toBe('run');
      expect(sm.previousState).toBe('walk');
      expect(idleOnExit).toHaveBeenCalledTimes(1);
      expect(walkOnExit).toHaveBeenCalledTimes(1);
      expect(runOnEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    test('应该调用当前状态的 onUpdate', () => {
      const onUpdate = jest.fn();
      sm.addState('idle', { onEnter: jest.fn(), onUpdate });
      sm.transition('idle');
      sm.update(16);
      expect(onUpdate).toHaveBeenCalledWith(16);
    });

    test('初始状态为 null 时 update 应该无效', () => {
      expect(() => sm.update(16)).not.toThrow();
    });

    test('当前状态没有 onUpdate 时应该无效', () => {
      sm.addState('idle', { onEnter: jest.fn() });
      sm.transition('idle');
      expect(() => sm.update(16)).not.toThrow();
    });
  });
});
