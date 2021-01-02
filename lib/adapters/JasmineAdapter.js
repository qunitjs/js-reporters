const EventEmitter = require('events');
const helpers = require('../helpers.js');

/**
 * Known limitations:
 *
 * - Errors in afterAll are ignored.
 */
module.exports = class JasmineAdapter extends EventEmitter {
  constructor (jasmine) {
    super();

    // NodeJS or browser
    this.env = jasmine.env || jasmine.getEnv();

    this.suiteStarts = {};
    this.suiteChildren = {};
    this.suiteEnds = {};
    this.testStarts = {};
    this.testEnds = {};

    // See <https://jasmine.github.io/api/3.6/Reporter.html>
    const reporter = {
      jasmineStarted: this.onJasmineStarted.bind(this),
      specDone: this.onSpecDone.bind(this),
      specStarted: this.onSpecStarted.bind(this),
      suiteStarted: this.onSuiteStarted.bind(this),
      suiteDone: this.onSuiteDone.bind(this),
      jasmineDone: this.onJasmineDone.bind(this)
    };

    if (jasmine.addReporter) {
      // For Node.js, use the method from jasmine-npm
      jasmine.addReporter(reporter);
    } else {
      // For browser, use the method from jasmine-core
      this.env.addReporter(reporter);
    }
  }

  createAssertion (expectation) {
    return {
      passed: expectation.passed,
      actual: expectation.actual,
      expected: expectation.expected,
      message: expectation.message,
      stack: expectation.stack !== '' ? expectation.stack : null
    };
  }

  createTestEnd (testStart, result) {
    const errors = result.failedExpectations.map((expectation) => this.createAssertion(expectation));
    const assertions = errors.concat(
      result.passedExpectations.map((expectation) => this.createAssertion(expectation))
    );

    return {
      name: testStart.name,
      suiteName: testStart.suiteName,
      fullName: testStart.fullName.slice(),
      status: (result.status === 'pending') ? 'skipped' : result.status,
      runtime: (result.status === 'pending') ? null : (new Date() - this.startTime),
      errors,
      assertions
    };
  }

  /**
   * Convert a Jasmine SuiteResult for CRI 'runStart' or 'suiteStart' event data.
   *
   * Jasmine provides details about childSuites and tests only in the structure
   * returned by "this.env.topSuite()".
   */
  createSuiteStart (result, parentNames) {
    const isGlobalSuite = (result.description === 'Jasmine__TopLevel__Suite');

    const name = isGlobalSuite ? null : result.description;
    const fullName = parentNames.slice();
    const tests = [];
    const childSuites = [];

    if (!isGlobalSuite) {
      fullName.push(result.description);
    }

    result.children.forEach((child) => {
      if (child.id.indexOf('suite') === 0) {
        childSuites.push(this.createSuiteStart(child, fullName));
      } else {
        const testStart = {
          name: child.description,
          suiteName: name,
          fullName: [...fullName, child.description]
        };
        tests.push(testStart);
        this.testStarts[child.id] = testStart;
      }
    });

    const helperData = helpers.collectSuiteStartData(tests, childSuites);
    const suiteStart = {
      name,
      fullName,
      tests,
      childSuites,
      testCounts: helperData.testCounts
    };
    this.suiteStarts[result.id] = suiteStart;
    this.suiteChildren[result.id] = result.children.map(child => child.id);
    return suiteStart;
  }

  createSuiteEnd (suiteStart, result) {
    const tests = [];
    const childSuites = [];
    this.suiteChildren[result.id].forEach((childId) => {
      if (childId.indexOf('suite') === 0) {
        childSuites.push(this.suiteEnds[childId]);
      } else {
        tests.push(this.testEnds[childId]);
      }
    });

    const helperData = helpers.collectSuiteEndData(tests, childSuites);
    return {
      name: suiteStart.name,
      fullName: suiteStart.fullName,
      tests,
      childSuites,
      // Jasmine has result.status, but does not propagate 'todo' or 'skipped'
      status: helperData.status,
      testCounts: helperData.testCounts,
      // Jasmine 3.4+ has result.duration, but uses 0 instead of null
      // when 'skipped' is skipped.
      runtime: helperData.status === 'skipped' ? null : (result.duration || helperData.runtime)
    };
  }

  onJasmineStarted () {
    this.globalSuite = this.createSuiteStart(this.env.topSuite(), []);
    this.emit('runStart', this.globalSuite);
  }

  onSuiteStarted (result) {
    this.emit('suiteStart', this.suiteStarts[result.id]);
  }

  onSpecStarted (result) {
    this.startTime = new Date();
    this.emit('testStart', this.testStarts[result.id]);
  }

  onSpecDone (result) {
    this.testEnds[result.id] = this.createTestEnd(this.testStarts[result.id], result);
    this.emit('testEnd', this.testEnds[result.id]);
  }

  onSuiteDone (result) {
    this.suiteEnds[result.id] = this.createSuiteEnd(this.suiteStarts[result.id], result);
    this.emit('suiteEnd', this.suiteEnds[result.id]);
  }

  onJasmineDone (doneInfo) {
    this.emit('runEnd', this.createSuiteEnd(this.globalSuite, this.env.topSuite()));
  }
};
