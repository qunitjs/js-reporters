const EventEmitter = require('events');
const hasOwn = Object.hasOwnProperty;

module.exports = class SummaryReporter extends EventEmitter {
  constructor (runner) {
    super();

    this.top = {
      name: null,
      tests: [],
      status: null,
      testCounts: null,
      runtime: null
    };

    // Map of full name to test objects
    this.attachedTests = {};

    // Map of full name to array of children test objects
    this.detachedChildren = {};

    this.summary = null;

    runner.on('suiteEnd', (suiteEnd) => {
      const ownFull = suiteEnd.fullName.join('>');
      const suiteName = suiteEnd.fullName.length >= 2 ? suiteEnd.fullName.slice(-2, -1)[0] : null;
      const parentFull = suiteEnd.fullName.length > 1 ? suiteEnd.fullName.slice(0, -1).join('>') : null;

      let children;
      if (hasOwn.call(this.detachedChildren, ownFull)) {
        children = this.detachedChildren[ownFull];
        delete this.detachedChildren[ownFull];
      } else {
        children = [];
      }

      const test = {
        ...suiteEnd,
        suiteName: suiteName,
        errors: [],
        assertions: [],
        tests: children
      };

      if (parentFull === null) {
        this.top.tests.push(test);
      } else if (hasOwn.call(this.attachedTests, parentFull)) {
        this.attachedTests[parentFull].tests.push(test);
      } else if (hasOwn.call(this.detachedChildren, parentFull)) {
        this.detachedChildren[parentFull].push(test);
      } else {
        this.detachedChildren[parentFull] = [test];
      }

      this.attachedTests[ownFull] = test;
    });

    runner.on('testEnd', (testEnd) => {
      const ownFull = testEnd.fullName.join('>');
      const parentFull = testEnd.fullName.length > 1 ? testEnd.fullName.slice(0, -1).join('>') : null;

      let children;
      if (hasOwn.call(this.detachedChildren, ownFull)) {
        children = this.detachedChildren[ownFull];
        delete this.detachedChildren[ownFull];
      } else {
        children = [];
      }

      const test = {
        ...testEnd,
        tests: children
      };

      if (parentFull === null) {
        this.top.tests.push(test);
      } else if (hasOwn.call(this.attachedTests, parentFull)) {
        this.attachedTests[parentFull].tests.push(test);
      } else if (hasOwn.call(this.detachedChildren, parentFull)) {
        this.detachedChildren[parentFull].push(test);
      } else {
        this.detachedChildren[parentFull] = [test];
      }

      this.attachedTests[ownFull] = test;
    });

    runner.once('runEnd', (runEnd) => {
      this.top.name = runEnd.name;
      this.top.status = runEnd.status;
      this.top.testCounts = runEnd.testCounts;
      this.top.runtime = runEnd.runtime;

      this.summary = this.top;

      const problems = Object.keys(this.detachedChildren).join(', ');
      if (problems.length) {
        console.error('detachedChildren:', problems);
      }
      this.top = null;
      this.attachedTests = null;
      this.detachedChildren = null;

      this.emit('summary', this.summary);
    });
  }

  static init (runner) {
    return new SummaryReporter(runner);
  }

  /**
   * Get the summary via callback or Promise.
   *
   * @param {Function} [callback]
   * @param {null|Error} [callback.err]
   * @param {Object} [callback.summary]
   * @return {undefined|Promise}
   */
  getSummary (callback) {
    if (callback) {
      if (this.summary) {
        callback(null, this.summary);
      } else {
        this.once('summary', (summary) => {
          callback(null, summary);
        });
      }
    } else {
      // Support IE 9-11: Only reference 'Promise' (which we don't polyfill) when needed.
      // If the user doesn't use this reporter, or only its callback signature, then it should
      // work in older browser as well.
      return new Promise((resolve) => {
        if (this.summary) {
          resolve(this.summary);
        } else {
          this.once('summary', (summary) => {
            resolve(summary);
          });
        }
      });
    }
  }
};
