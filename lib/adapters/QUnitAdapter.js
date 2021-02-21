const EventEmitter = require('events');
const helpers = require('../helpers.js');

/**
 * Known limitations:
 *
 * - Due to ordering issues with nested modules on QUnit < 2.2, this adapter
 *   buffers events and only emits them after the run has completed.
 *   See <https://github.com/js-reporters/js-reporters/pull/60>
 */
module.exports = class QUnitAdapter extends EventEmitter {
  constructor (QUnit) {
    super();

    this.QUnit = QUnit;
    this.testEnds = {};
    this.moduleEnds = [];
    this.delim = ' > ';
    this.totalBegin = null;

    // Ordered lists
    this.globalTests = null;
    this.globalModules = null;

    QUnit.begin(this.onBegin.bind(this));
    QUnit.log(this.onLog.bind(this));
    QUnit.testDone(this.onTestDone.bind(this));
    QUnit.done(this.onDone.bind(this));
  }

  prepTestEnd (suiteName, parentNames, details) {
    const testEnd = this.testEnds[details.testId] = {
      name: details.name,
      suiteName: suiteName,
      fullName: [...parentNames, details.name],
      // Placeholders, populated by onTestDone() and onLog()
      status: null,
      runtime: null,
      errors: [],
      assertions: []
    };
    return testEnd;
  }

  processModule (qunitModule) {
    const fullName = qunitModule.name.split(this.delim);
    const name = fullName.slice(-1)[0];

    const childTests = qunitModule.tests.map((details) => {
      return this.prepTestEnd(name, fullName, details);
    });

    return {
      suiteEnd: {
        name,
        fullName,
        // Placeholders, populated by emitTests()
        status: null,
        runtime: null
      },
      childTests,
      childModules: []
    };
  }

  processEverything () {
    let modules;

    // Access QUnit internals to get all modules and tests,
    // working around missing event data.

    // First, find any global tests.
    if (this.QUnit.config.modules.length > 0 &&
        this.QUnit.config.modules[0].name === '') {
      this.globalTests = this.QUnit.config.modules[0].tests.map((details) => this.prepTestEnd(null, [], details));
      modules = this.QUnit.config.modules.slice(1);
    } else {
      this.globalTests = [];
      modules = this.QUnit.config.modules;
    }

    // Prepare all suiteEnd leafs
    modules = modules.map(this.processModule.bind(this));

    // For CRI, each module will be represented as a wrapper test
    this.totalBegin = Object.keys(this.testEnds).length + modules.length;

    // If a module has a composed name, its name will be the last part of the full name
    // and its parent name will be the one right before it. Search for the parent
    // module and add the current module to it as a child, among the test leafs.
    const globalModules = [];
    modules.forEach((mod) => {
      if (mod.suiteEnd.fullName.length > 1) {
        const parentFullName = mod.suiteEnd.fullName.slice(0, -1);
        modules.forEach((otherMod) => {
          if (otherMod.suiteEnd.fullName.join(this.delim) === parentFullName.join(this.delim)) {
            otherMod.childModules.push(mod);
          }
        });
      } else {
        globalModules.push(mod);
      }
    });
    this.globalModules = globalModules;
  }

  emitTests () {
    this.globalTests.forEach((testEnd) => {
      this.emit('testStart', helpers.createTestStart(testEnd));
      this.emit('testEnd', testEnd);
    });

    const emitModule = (mod) => {
      this.emit('suiteStart', {
        name: mod.suiteEnd.name,
        fullName: mod.suiteEnd.fullName.slice()
      });

      mod.childTests.forEach((testEnd) => {
        this.emit('testStart', helpers.createTestStart(testEnd));
        this.emit('testEnd', testEnd);
      });
      mod.childModules.forEach(child => emitModule(child));

      // This is non-recursive and can be because we emit modules in the original
      // depth-first execution order. We fill in the status/runtime placeholders
      // for the suiteEnd object of a nested module, and then later a parent module
      // follows and sees that child suiteEnd object by reference and can propagate
      // and aggregate the information further.
      const helperData = helpers.aggregateTests([
        ...mod.childTests,
        ...mod.childModules.map(child => child.suiteEnd)
      ]);
      mod.suiteEnd.status = helperData.status;
      mod.suiteEnd.runtime = helperData.runtime;

      this.moduleEnds.push(mod.suiteEnd);
      this.emit('suiteEnd', mod.suiteEnd);
    };
    this.globalModules.forEach(emitModule);
  }

  onBegin (details) {
    this.processEverything();

    this.emit('runStart', {
      name: null,
      testCounts: {
        total: this.totalBegin
      }
    });
  }

  onLog (details) {
    const assertion = {
      passed: details.result,
      actual: details.actual,
      expected: details.expected,
      message: details.message,
      stack: details.source || null
    };
    if (this.testEnds[details.testId]) {
      if (!details.result) {
        this.testEnds[details.testId].errors.push(assertion);
      }
      this.testEnds[details.testId].assertions.push(assertion);
    }
  }

  onTestDone (details) {
    const testEnd = this.testEnds[details.testId];

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

  onDone (details) {
    this.emitTests();

    const allTests = [...this.moduleEnds];
    for (const testId in this.testEnds) {
      allTests.push(this.testEnds[testId]);
    }
    const helperData = helpers.aggregateTests(allTests);

    this.emit('runEnd', {
      name: null,
      status: helperData.status,
      testCounts: helperData.testCounts,
      runtime: details.runtime || null
    });
  }
};
