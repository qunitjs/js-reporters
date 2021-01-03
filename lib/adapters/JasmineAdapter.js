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

    this.suiteChildren = {};
    this.suiteEnds = [];
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
      parentName: testStart.parentName,
      fullName: testStart.fullName.slice(),
      status: (result.status === 'pending') ? 'skipped' : result.status,
      // TODO: Jasmine 3.4+ has result.duration, use it.
      // Note that result.duration uses 0 instead of null for a 'skipped' test.
      runtime: (result.status === 'pending') ? null : (new Date() - this.startTime),
      errors,
      assertions
    };
  }

  /**
   * Traverse the Jasmine structured returned by `this.env.topSuite()`
   * in order to extract the child-parent relations and full names.
   *
   */
  processSuite (result, parentNames, parentIds) {
    const isGlobalSuite = (result.description === 'Jasmine__TopLevel__Suite');

    const name = isGlobalSuite ? null : result.description;
    const fullName = parentNames.slice();

    if (!isGlobalSuite) {
      fullName.push(name);
    }

    parentIds.push(result.id);
    this.suiteChildren[result.id] = [];

    result.children.forEach((child) => {
      this.testStarts[child.id] = {
        name: child.description,
        parentName: name,
        fullName: [...fullName, child.description]
      };

      if (child.id.indexOf('suite') === 0) {
        this.processSuite(child, fullName.slice(), parentIds.slice());
      } else {
        // Update flat list of test children
        parentIds.forEach((id) => {
          this.suiteChildren[id].push(child.id);
        });
      }
    });
  }

  createSuiteEnd (testStart, result) {
    const tests = this.suiteChildren[result.id].map((testId) => this.testEnds[testId]);

    const helperData = helpers.aggregateTests(tests);
    return {
      name: testStart.name,
      parentName: testStart.parentName,
      fullName: testStart.fullName,
      // Jasmine has result.status, but does not propagate 'todo' or 'skipped'
      status: helperData.status,
      runtime: result.duration || helperData.runtime,
      errors: [],
      assertions: []
    };
  }

  onJasmineStarted () {
    this.processSuite(this.env.topSuite(), [], []);

    let total = 0;
    this.env.topSuite().children.forEach(function countChild (child) {
      total++;
      if (child.id.indexOf('suite') === 0) {
        child.children.forEach(countChild);
      }
    });

    this.emit('runStart', {
      name: null,
      counts: {
        total: total
      }
    });
  }

  onSuiteStarted (result) {
    this.emit('testStart', this.testStarts[result.id]);
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
    const suiteEnd = this.createSuiteEnd(this.testStarts[result.id], result);
    this.suiteEnds.push(suiteEnd);
    this.emit('testEnd', suiteEnd);
  }

  onJasmineDone (doneInfo) {
    const topSuite = this.env.topSuite();
    const tests = this.suiteChildren[topSuite.id].map((testId) => this.testEnds[testId]);
    const helperData = helpers.aggregateTests([...tests, ...this.suiteEnds]);
    this.emit('runEnd', {
      name: null,
      status: helperData.status,
      counts: helperData.counts,
      runtime: helperData.runtime
    });
  }
};
