const {Component} = require('./component');

/**
 * Base class for Provisioners
 *
 * This emits:
 *   'requested', workerId, {capacity, utility} -- when a worker is requested
 *   'started', workerId -- when a worker starts up and attempts its first claim
 *   'shutdown', workerId -- when a worker shuts down
  */
class Provisioner extends Component {
  constructor({core}) {
    super({core});

    // tracks the current set of running workers
    this.workers = new Map();
  }

  registerWorker(worker) {
    const {name, capacity, utility} = worker;
    this.workers.set(name, worker);

    this.emit('requested', name, {capacity, utility});
    worker.once('started', () => this.emit('started', name));
    worker.once('shutdown', () => {
      this.emit('shutdown', name);
      this.workers.delete(name);
    });
  }

  start() {}

  stop() {
    // check that all workers have stopped
    const runningWorkers = this.workers.size;
    if (runningWorkers !== 0) {
      this.log(`NOTE: ${runningWorkers} workers still running at end of ramp-down phase`);
    }
  }
}

exports.Provisioner = Provisioner;
