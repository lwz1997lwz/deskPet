class StateMachine {
  constructor() {
    this.states = {};
    this.currentState = null;
    this.previousState = null;
  }

  addState(name, config) {
    if (!name || typeof name !== 'string') {
      throw new Error('状态名称必须是非空字符串');
    }
    if (!config || typeof config !== 'object') {
      throw new Error('状态配置必须是对象');
    }
    this.states[name] = config;
  }

  transition(newState) {
    if (this.states[newState]) {
      // 调用当前状态的 onExit 回调
      if (this.currentState && this.states[this.currentState]?.onExit) {
        this.states[this.currentState].onExit();
      }
      this.previousState = this.currentState;
      this.currentState = newState;
      if (this.states[newState].onEnter) {
        this.states[newState].onEnter();
      }
    }
  }

  update(deltaTime) {
    if (this.currentState && this.states[this.currentState].onUpdate) {
      this.states[this.currentState].onUpdate(deltaTime);
    }
  }
}

module.exports = StateMachine;
