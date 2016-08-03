function getAllTests (suite) {
  var childSuiteTests = suite.childSuites
    .map((childSuite) => getAllTests(childSuite))
    .reduce((allTests, a) => allTests.concat(a), [])

  return suite.tests.concat(childSuiteTests)
}

function getRuntime (suite) {
  if (suite.status === 'skipped' || suite.status === undefined) {
    return undefined
  }

  return getAllTests(suite)
    .map((test) => test.status === 'skipped' ? 0 : test.runtime)
    .reduce((sum, testRuntime) => sum + testRuntime, 0)
}

function getStatus (suite) {
  var passed = 0
  var failed = 0
  var skipped = 0
  var tests = getAllTests(suite)

  for (let i = 0; i < tests.length; i++) {
    let test = tests[i]

    // If a suite contains a test whose status is still undefined,
    // there is no final status for the suite as well.
    if (test.status === undefined) {
      return undefined
    } else if (test.status === 'passed') {
      passed++
    } else if (test.status === 'skipped') {
      skipped++
    } else {
      failed++
    }
  }

  if (failed > 0) {
    return 'failed'
  } else if (skipped > 0 && passed === 0) {
    return 'skipped'
  } else {
    return 'passed'
  }
}

function getTestCounts (suite) {
  var tests = getAllTests(suite)

  // If the suite does not have a status, it means that its tests haven't
  // finished to run, so we know only the total.
  if (!suite.status) {
    return {
      passed: undefined,
      failed: undefined,
      skipped: undefined,
      total: tests.length
    }
  }

  return {
    passed: tests.filter((test) => test.status === 'passed').length,
    failed: tests.filter((test) => test.status === 'failed').length,
    skipped: tests.filter((test) => test.status === 'skipped').length,
    total: tests.length
  }
}

export class Assertion {
  /**
   * @param {Boolean} passed
   * @param {*} actual
   * @param {*} expected
   * @param {String} message
   * @param {String|undefined} stack
   */
  constructor (passed, actual, expected, message, stack) {
    this.passed = passed
    this.actual = actual
    this.expected = expected
    this.message = message
    this.stack = stack
  }
}

export class Test {
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
    this.name = name
    this.suiteName = suiteName
    this.fullName = fullName
    this.status = status
    this.runtime = runtime
    this.errors = errors
    this.assertions = assertions
  }
}

export class Suite {
  /**
   * @param {String} name
   * @param {String[]} fullName
   * @param {Suite[]} childSuites
   * @param {Test[]} tests
   */
  constructor (name, fullName, childSuites, tests) {
    this.name = name
    this.fullName = fullName
    this.childSuites = childSuites
    this.tests = tests
    /**
     * @type {String}
     */
    this.status = getStatus(this)
    /**
     * @param {Object} testCounts
     * @param {Number} testCounts.passed
     * @param {Number} testCounts.failed
     * @param {Number} testCounts.skipped
     * @param {Number} testCounts.total
     */
    this.testCounts = getTestCounts(this)
    /**
     * @type {Number}
     */
    this.runtime = getRuntime(this)
  }
}
