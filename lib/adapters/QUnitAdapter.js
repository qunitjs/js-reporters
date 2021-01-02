const EventEmitter = require('events');
const helpers = require('../helpers.js');

/**
 * Known limitations:
 *
 * - Due to ordering issues with nested suites on QUnit < 2.2, this adapter
 *   buffers events and only emits them after the run has completed.
 *   See <https://github.com/js-reporters/js-reporters/pull/60>
 */
module.exports = class QUnitAdapter extends EventEmitter {
  constructor (QUnit) {
    super();

    this.QUnit = QUnit;
    this.globalSuite = null;
    this.tests = {};
    this.delim = ' > ';

    QUnit.begin(this.onBegin.bind(this));
    QUnit.log(this.onLog.bind(this));
    QUnit.testDone(this.onTestDone.bind(this));
    QUnit.done(this.onDone.bind(this));
  }

  createSuiteEnd (qunitModule) {
    const fullName = qunitModule.name ? qunitModule.name.split(this.delim) : [];
    // Keep only the name of the suite itself.
    const name = fullName.length ? fullName.slice(-1)[0] : '';

    return {
      name,
      fullName,
      tests: qunitModule.tests.map((details) => {
        const testEnd = {
          name: details.name,
          suiteName: name,
          fullName: [...fullName, details.name],
          // Placeholders, populated by onTestDone() and onLog()()
          status: null,
          runtime: null,
          errors: [],
          assertions: []

        };

        this.tests[details.testId] = testEnd;
        return testEnd;
      }),
      // Placeholders, populated by createGlobalSuite() and onDone()
      childSuites: [],
      status: null,
      testCounts: null,
      runtime: null
    };
  }

  createGlobalSuite () {
    let globalSuite;
    let modules;

    // Access QUnit internals to get all suites and tests,
    // working around missing event data.

    // Create the global suite first.
    if (this.QUnit.config.modules.length > 0 &&
        this.QUnit.config.modules[0].name === '') {
      globalSuite = this.createSuiteEnd(this.QUnit.config.modules[0]);
      // The name of the global suite must be null.
      globalSuite.name = null;
      globalSuite.tests.forEach((test) => {
        test.suiteName = null;
      });

      modules = this.QUnit.config.modules.slice(1);
    } else {
      globalSuite = {
        name: null,
        fullName: [],
        tests: [],
        childSuites: [],
        status: null,
        testCounts: null,
        runtime: null
      };
      modules = this.QUnit.config.modules;
    }

    // Build a list with all suites.
    const suites = modules.map(this.createSuiteEnd.bind(this));

    // If a suite has a composed name, its name will be the last in the sequence
    // and its parent name will be the one right before it. Search the parent
    // suite after its name and then add the suite with the composed name to the
    // childSuites.
    //
    // If a suite does not have a composed name, add it to the topLevelSuites,
    // this means that this suite is the direct child of the global suite.
    suites.forEach((suite) => {
      if (suite.fullName.length >= 2) {
        const parentFullName = suite.fullName.slice(0, -1);
        suites.forEach((otherSuite) => {
          if (otherSuite.fullName.join(this.delim) === parentFullName.join(this.delim)) {
            otherSuite.childSuites.push(suite);
          }
        });
      } else {
        globalSuite.childSuites.push(suite);
      }
    });

    return globalSuite;
  }

  emitData (suite) {
    suite.tests.forEach((test) => {
      this.emit('testStart', helpers.createTestStart(test));
      this.emit('testEnd', test);
    });

    suite.childSuites.forEach((childSuite) => {
      this.emit('suiteStart', helpers.createSuiteStart(childSuite));
      this.emitData(childSuite);
      this.emit('suiteEnd', childSuite);
    });
  }

  onBegin () {
    this.globalSuite = this.createGlobalSuite();
  }

  onLog (details) {
    const assertion = {
      passed: details.result,
      actual: details.actual,
      expected: details.expected,
      message: details.message,
      stack: details.source || null
    };
    if (this.tests[details.testId]) {
      if (!details.result) {
        this.tests[details.testId].errors.push(assertion);
      }
      this.tests[details.testId].assertions.push(assertion);
    }
  }

  onTestDone (details) {
    const testEnd = this.tests[details.testId];

    if (details.failed > 0) {
      testEnd.status = 'failed';
    } else if (details.skipped) {
      testEnd.status = 'skipped';
    } else {
      testEnd.status = 'passed';
    }

    // QUnit uses 0 instead of null for runtime of skipped tests.
    if (!details.skipped) {
      testEnd.runtime = details.runtime;
    } else {
      testEnd.runtime = null;
    }
  }

  onDone () {
    [this.globalSuite].forEach(function setSuiteEndData (suite) {
      const helperData = helpers.collectSuiteEndData(suite.tests, suite.childSuites);
      suite.status = helperData.status;
      suite.testCounts = helperData.testCounts;
      suite.runtime = helperData.runtime;

      suite.childSuites.forEach(setSuiteEndData);
    });

    this.emit('runStart', helpers.createSuiteStart(this.globalSuite));
    this.emitData(this.globalSuite);
    this.emit('runEnd', this.globalSuite);
  }
};
