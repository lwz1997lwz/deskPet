const StateMachine = require('../../src/cat/state-machine');

describe('StateMachine', () => {
  let sm;

  beforeEach(() => {
    sm = new StateMachine();
  });

  test('应该添加状态', () => {
    sm.addState('idle', { onEnter: jest.fn(), onUpdate: jest.fn() });
    expect(sm.states.idle).toBeDefined();
  });

  test('应该转换状态', () => {
    const onEnter = jest.fn();
    sm.addState('idle', { onEnter, onUpdate: jest.fn() });
    sm.addState('walk', { onEnter: jest.fn(), onUpdate: jest.fn() });
    sm.transition('walk');
    expect(sm.currentState).toBe('walk');
    expect(onEnter).not.toHaveBeenCalled();
  });

  test('应该调用 onEnter', () => {
    const onEnter = jest.fn();
    sm.addState('idle', { onEnter, onUpdate: jest.fn() });
    sm.transition('idle');
    expect(onEnter).toHaveBeenCalled();
  });
});
