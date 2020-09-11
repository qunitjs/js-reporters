const EventEmitter = require('events');
const { Assertion, TestStart, TestEnd, SuiteStart, SuiteEnd } = require('../Data.js');

module.exports = class MochaAdapter extends EventEmitter {
  constructor (mocha) {
    super();

    this.mocha = mocha;

    // Mocha will instantiate the given function as a constructor
    // even if you only need a callback.
    // As such, it can't be an arrow function as those throw TypeError
    // if instantiated.
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
    return new SuiteStart(
      mochaSuite.title,
      this.buildSuiteFullName(mochaSuite),
      mochaSuite.tests.map(this.convertTest.bind(this)),
      mochaSuite.suites.map(this.convertToSuiteStart.bind(this))
    );
  }

  convertToSuiteEnd (mochaSuite) {
    return new SuiteEnd(
      mochaSuite.title,
      this.buildSuiteFullName(mochaSuite),
      mochaSuite.tests.map(this.convertTest.bind(this)),
      mochaSuite.suites.map(this.convertToSuiteEnd.bind(this))
    );
  }

  convertTest (mochaTest) {
    let suiteName;
    let fullName;

    if (!mochaTest.parent.root) {
      suiteName = mochaTest.parent.title;
      fullName = this.buildSuiteFullName(mochaTest.parent);
      // Add also the test name.
      fullName.push(mochaTest.title);
    } else {
      fullName = [mochaTest.title];
    }

    // If the test has the errors attached a "test end" must be emitted, else
    // a "test start".
    if (mochaTest.errors !== undefined) {
      const status = (mochaTest.state === undefined) ? 'skipped' : mochaTest.state;
      const errors = [];

      mochaTest.errors.forEach(function (error) {
        errors.push(new Assertion(false, error.actual, error.expected,
          error.message || error.toString(), error.stack));
      });

      // Test end, for the assertions property pass an empty array.
      return new TestEnd(mochaTest.title, suiteName, fullName, status,
        mochaTest.duration, errors, errors);
    }

    // Test start.
    return new TestStart(mochaTest.title, suiteName, fullName);
  }

  /**
   * Builds an array with the names of nested suites.
   */
  buildSuiteFullName (mochaSuite) {
    const fullName = [];
    let parent = mochaSuite.parent;

    if (!mochaSuite.root) {
      fullName.push(mochaSuite.title);
    }

    while (parent && !parent.root) {
      fullName.unshift(parent.title);
      parent = parent.parent;
    }

    return fullName;
  }

  onStart () {
    const globalSuiteStart = this.convertToSuiteStart(this.runner.suite);
    globalSuiteStart.name = undefined;

    this.emit('runStart', globalSuiteStart);
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
   * Emits the start of pending tests, because Mocha does not emit skipped tests
   * on its "test" event.
   */
  onPending (mochaTest) {
    this.emit('testStart', this.convertTest(mochaTest));
  }

  onFail (test, error) {
    this.errors.push(error);
  }

  onTestEnd (mochaTest) {
    // Save the errors on Mocha's test object, because when the suite that
    // contains this test is emitted on the "suiteEnd" event, it should contain
    // also this test with all its details (errors, status, runtime). Runtime
    // and status are already attached to the test, but the errors don't.
    mochaTest.errors = this.errors;

    this.emit('testEnd', this.convertTest(mochaTest));
  }

  onSuiteEnd (mochaSuite) {
    if (!mochaSuite.root) {
      this.emit('suiteEnd', this.convertToSuiteEnd(mochaSuite));
    }
  }

  onEnd () {
    const globalSuiteEnd = this.convertToSuiteEnd(this.runner.suite);
    globalSuiteEnd.name = undefined;

    this.emit('runEnd', globalSuiteEnd);
  }
};
