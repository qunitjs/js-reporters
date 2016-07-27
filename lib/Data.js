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

export class Test {
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
   *
   * @param name
   * @param childSuites
   * @param tests: array containing tests belonging to the suite but not to a child suite
   */
  constructor (name, fullName, childSuites, tests) {
    this.name = name
    this.fullName = fullName
    this.childSuites = childSuites
    this.tests = tests
    this.status = getStatus(this)
    this.runtime = getRuntime(this)
  }
}
