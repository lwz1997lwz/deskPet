const os = require('os');

class SystemMonitor {
  constructor() {
    this.cpuUsage = 0;
    this.memoryUsage = 0;
    this.updateInterval = null;
    this.callbacks = [];
  }

  start(interval = 2000) {
    this.update();
    this.updateInterval = setInterval(() => this.update(), interval);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  update() {
    this.cpuUsage = this.getCpuUsage();
    this.memoryUsage = this.getMemoryUsage();
    this.notify();
  }

  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return Math.round((1 - totalIdle / totalTick) * 100);
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    return Math.round((1 - free / total) * 100);
  }

  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  notify() {
    const data = {
      cpu: this.cpuUsage,
      memory: this.memoryUsage
    };
    this.callbacks.forEach(cb => cb(data));
  }

  getStatus() {
    return {
      cpu: this.cpuUsage,
      memory: this.memoryUsage,
      cpuLevel: this.cpuUsage < 60 ? 'normal' : this.cpuUsage < 80 ? 'high' : 'critical',
      memoryLevel: this.memoryUsage < 70 ? 'normal' : 'high'
    };
  }
}

module.exports = SystemMonitor;
