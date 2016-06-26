export class Test {
  constructor (testName, suiteName, status, runtime, errors) {
    this.testName = testName
    this.suiteName = suiteName
    this.status = status
    this.runtime = runtime
    this.errors = errors
  }
}

export class Suite {

  /**
   *
   * @param name
   * @param childSuites
   * @param tests: array containing tests belonging to the suite but not to a child suite
   */
  constructor (name, childSuites, tests) {
    this.name = name
    this.childSuites = childSuites
    this.tests = tests
  }

  getAllTests () {
    var childSuiteTests = this.childSuites
      .map((suite) => suite.getAllTests())
      .reduce((allTests, a) => allTests.concat(a), [])

    return this.tests.concat(childSuiteTests)
  }

  get runtime () {
    var tests = this.getAllTests()

    // If a test has not been executed, the runtime of the suite is undefined.
    for (var i = 0; i < tests.length; i++) {
      if (tests[i].status === undefined) {
        return undefined
      }
    }

    var runtime = this.getAllTests()
      .map((test) => test.status === 'skipped' ? 0 : test.runtime)
      .reduce((sum, testRuntime) => sum + testRuntime, 0)

    return runtime
  }

  get status () {
    var passed = 0
    var failed = 0
    var skipped = 0

    for (let test of this.getAllTests()) {
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
}

Object.defineProperties(Suite.prototype, {
  toJSON: {
    value: function () {
      let ret = {}
      for (let x in this) {
        ret[x] = this[x]
      }
      return ret
    }
  },
  runtime: {
    enumerable: true
  },
  status: {
    enumerable: true
  }
})
