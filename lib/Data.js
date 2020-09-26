function getAllTests (suite) {
  const childSuiteTests = suite.childSuites
    .map((childSuite) => getAllTests(childSuite))
    .reduce((allTests, a) => allTests.concat(a), []);

  return suite.tests.concat(childSuiteTests);
}

// @deprecated, use helpers.collectSuiteEndData() instead.
function getRuntime (suite) {
  if (suite.status === 'skipped' || suite.status === undefined) {
    return undefined;
  }

  return getAllTests(suite)
    .map((test) => test.status === 'skipped' ? 0 : test.runtime)
    .reduce((sum, testRuntime) => sum + testRuntime, 0);
}

// @deprecated, use helpers.collectSuiteEndData() instead.
function getStatus (suite) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let todo = 0;
  const tests = getAllTests(suite);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    // If a suite contains a test whose status is still undefined,
    // there is no final status for the suite as well.
    if (test.status === undefined) {
      return undefined;
    } else if (test.status === 'passed') {
      passed++;
    } else if (test.status === 'skipped') {
      skipped++;
    } else if (test.status === 'todo') {
      todo++;
    } else {
      failed++;
    }
  }

  if (failed > 0) {
    return 'failed';
  } else if (skipped > 0 && passed === 0) {
    return 'skipped';
  } else if (todo > 0 && passed === 0) {
    return 'todo';
  } else {
    return 'passed';
  }
}

// @deprecated, use helpers.collectSuiteStartData() instead.
function getSuiteStartTestCounts (suite) {
  const tests = getAllTests(suite);

  return {
    total: tests.length
  };
}

// @deprecated, use helpers.collectSuiteEndData() instead.
function getSuiteEndTestCounts (suite) {
  const tests = getAllTests(suite);

  return {
    passed: tests.filter((test) => test.status === 'passed').length,
    failed: tests.filter((test) => test.status === 'failed').length,
    skipped: tests.filter((test) => test.status === 'skipped').length,
    todo: tests.filter((test) => test.status === 'todo').length,
    total: tests.length
  };
}

class Assertion {
  /**
   * @param {Boolean} passed
   * @param {*} actual
   * @param {*} expected
   * @param {String} message
   * @param {String|undefined} stack
   */
  constructor (passed, actual, expected, message, stack) {
    this.passed = passed;
    this.actual = actual;
    this.expected = expected;
    this.message = message;
    this.stack = stack;
  }
}

class TestStart {
  /**
   * @param {String} name
   * @param {String} suiteName
   * @param {String[]} fullName
   */
  constructor (name, suiteName, fullName) {
    this.name = name;
    this.suiteName = suiteName;
    this.fullName = fullName;
  }
}

class TestEnd {
  /**
   * @param {String} name
   * @param {String} suiteName
   * @param {String[]} fullName
   * @param {String} status
   * @param {Number} runtime
   * @param {Assertion[]} errors
   * @param {Assertion[]} assertions
   */
  constructor (name, suiteName, fullName, status, runtime, errors, assertions) {
    this.name = name;
    this.suiteName = suiteName;
    this.fullName = fullName;
    this.status = status;
    this.runtime = runtime;
    this.errors = errors;
    this.assertions = assertions;
  }
}

class SuiteStart {
  /**
   * @param {String} name
   * @param {String[]} fullName
   * @param {TestStart[]} tests
   * @param {SuiteStart[]} childSuites
   */
  constructor (name, fullName, tests, childSuites, testCounts) {
    this.name = name;
    this.fullName = fullName;
    this.tests = tests;
    this.childSuites = childSuites;
    this.testCounts = getSuiteStartTestCounts(this);
  }
}

class SuiteEnd {
  /**
   * @param {String} name
   * @param {String[]} fullName
   * @param {TestEnd[]} tests
   * @param {SuiteEnd[]} childSuites
   * @param {String} status
   * @param {Object} testCounts
   * @param {Number} testCounts.passed
   * @param {Number} testCounts.failed
   * @param {Number} testCounts.skipped
   * @param {Number} testCounts.total
   * @param {Number} runtime
   */
  constructor (name, fullName, tests, childSuites, status, testCounts,
    runtime) {
    this.name = name;
    this.fullName = fullName;
    this.tests = tests;
    this.childSuites = childSuites;
    this.status = status || getStatus(this);
    this.testCounts = testCounts || getSuiteEndTestCounts(this);
    this.runtime = runtime || getRuntime(this);
  }
}

module.exports = {
  Assertion,
  TestStart,
  TestEnd,
  SuiteStart,
  SuiteEnd
};
