const os = require('os');

class SystemMonitor {
  constructor() {
    this.cpuUsage = 0;
    this.memoryUsage = 0;
    this.updateInterval = null;
    this.callbacks = [];
    this.lastCpuTimes = null; // 保存上一次 CPU 快照，用于计算真实使用率
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

    // 如果有上一次快照，计算差值
    if (this.lastCpuTimes) {
      const deltaIdle = totalIdle - this.lastCpuTimes.idle;
      const deltaTotal = totalTick - this.lastCpuTimes.total;
      this.lastCpuTimes = { idle: totalIdle, total: totalTick };
      // 防止除零
      if (deltaTotal === 0) return 0;
      return Math.round((1 - deltaIdle / deltaTotal) * 100);
    }

    // 第一次调用，保存快照并返回 0
    this.lastCpuTimes = { idle: totalIdle, total: totalTick };
    return 0;
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    return Math.round((1 - free / total) * 100);
  }

  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  offUpdate(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  notify() {
    const data = {
      cpu: this.cpuUsage,
      memory: this.memoryUsage
    };
    this.callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error('SystemMonitor 回调执行失败:', err);
      }
    });
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
