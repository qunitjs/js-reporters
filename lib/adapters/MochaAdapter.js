const EventEmitter = require('events');
const helpers = require('../helpers.js');

module.exports = class MochaAdapter extends EventEmitter {
  constructor (mocha) {
    super();

    this.errors = null;
    this.finalRuntime = 0;
    this.finalCounts = {
      passed: 0,
      failed: 0,
      skipped: 0,
      todo: 0,
      total: 0
    };

    // Mocha will instantiate the given function as a class, even if you only need a callback.
    // As such, it can't be an arrow function as those throw TypeError when instantiated.
    const self = this;
    mocha.reporter(function (runner) {
      self.runner = runner;

      runner.on('start', self.onStart.bind(self));
      runner.on('suite', self.onSuite.bind(self));
      runner.on('test', self.onTest.bind(self));
      runner.on('pending', self.onPending.bind(self));
      runner.on('fail', self.onFail.bind(self));
      runner.on('test end', self.onTestEnd.bind(self));
      runner.on('suite end', self.onSuiteEnd.bind(self));
      runner.on('end', self.onEnd.bind(self));
    });
  }

  convertToSuiteStart (mochaSuite) {
    return {
      name: mochaSuite.title,
      fullName: this.titlePath(mochaSuite)
    };
  }

  convertToSuiteEnd (mochaSuite) {
    const tests = mochaSuite.tests.map(this.convertTest.bind(this));
    const childSuites = mochaSuite.suites.map(this.convertToSuiteEnd.bind(this));
    const helperData = helpers.aggregateTests([...tests, ...childSuites]);

    return {
      name: mochaSuite.title,
      fullName: this.titlePath(mochaSuite),
      status: helperData.status,
      runtime: helperData.runtime
    };
  }

  convertTest (mochaTest) {
    let suiteName;
    let fullName;
    if (!mochaTest.parent.root) {
      suiteName = mochaTest.parent.title;
      fullName = this.titlePath(mochaTest.parent);
      // Add also the test name.
      fullName.push(mochaTest.title);
    } else {
      suiteName = null;
      fullName = [mochaTest.title];
    }

    if (mochaTest.errors !== undefined) {
      // If the test has the 'errors' property, this is a "test end".
      const errors = mochaTest.errors.map((error) => ({
        passed: false,
        actual: error.actual,
        expected: error.expected,
        message: error.message || error.toString(),
        stack: error.stack
      }));
      // Mocha 8.0 introduced STATE_PENDING
      // https://github.com/qunitjs/js-reporters/issues/116
      const status = (mochaTest.state === undefined || mochaTest.state === 'pending') ? 'skipped' : mochaTest.state;
      const runtime = (mochaTest.duration === undefined) ? null : mochaTest.duration;

      return {
        name: mochaTest.title,
        suiteName,
        fullName,
        status,
        runtime,
        errors,
        assertions: errors
      };
    } else {
      // It is a "test start".
      return {
        name: mochaTest.title,
        suiteName,
        fullName
      };
    }
  }

  titlePath (mochaSuite) {
    if (mochaSuite.titlePath) {
      // Mocha 4.0+ has Suite#titlePath()
      return mochaSuite.titlePath();
    }

    const fullName = [];
    if (!mochaSuite.root) {
      fullName.push(mochaSuite.title);
    }
    let parent = mochaSuite.parent;
    while (parent && !parent.root) {
      fullName.unshift(parent.title);
      parent = parent.parent;
    }
    return fullName;
  }

  onStart () {
    // total is all tests + all suites
    // each suite gets a CRI "test" wrapper
    let total = this.runner.suite.total();
    this.runner.suite.suites.forEach(function addSuites (suite) {
      total++;
      suite.suites.forEach(addSuites);
    });
    this.emit('runStart', {
      name: null,
      testCounts: {
        total: total
      }
    });
  }

  onSuite (mochaSuite) {
    if (!mochaSuite.root) {
      this.emit('suiteStart', this.convertToSuiteStart(mochaSuite));
    }
  }

  onTest (mochaTest) {
    this.errors = [];

    this.emit('testStart', this.convertTest(mochaTest));
  }

  /**
   * Mocha emits skipped tests here instead of on the "test" event.
   */
  onPending (mochaTest) {
    this.emit('testStart', this.convertTest(mochaTest));
  }

  onFail (test, error) {
    this.errors.push(error);
  }

  onTestEnd (mochaTest) {
    // Save the errors on Mocha's test object, because when the suite that
    // contains this test is emitted on the "suiteEnd" event, it should also
    // contain this test with all its details (errors, status, runtime). Runtime
    // and status are already attached to the test, but the errors are not.
    mochaTest.errors = this.errors;

    const testEnd = this.convertTest(mochaTest);
    this.emit('testEnd', testEnd);
    this.finalCounts.total++;
    this.finalCounts[testEnd.status]++;
    this.finalRuntime += testEnd.runtime || 0;
  }

  onSuiteEnd (mochaSuite) {
    if (!mochaSuite.root) {
      const suiteEnd = this.convertToSuiteEnd(mochaSuite);
      this.emit('suiteEnd', suiteEnd);
      this.finalCounts.total++;
      this.finalCounts[suiteEnd.status]++;
      this.finalRuntime += suiteEnd.runtime || 0;
    }
  }

  onEnd (details) {
    this.emit('runEnd', {
      name: null,
      status: this.finalCounts.failed > 0 ? 'failed' : 'passed',
      testCounts: this.finalCounts,
      runtime: this.finalRuntime
    });
  }
};
