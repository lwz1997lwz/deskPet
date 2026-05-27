class StateMachine {
  constructor() {
    this.states = {};
    this.currentState = null;
    this.previousState = null;
  }

  addState(name, config) {
    this.states[name] = config;
  }

  transition(newState) {
    if (this.states[newState]) {
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
