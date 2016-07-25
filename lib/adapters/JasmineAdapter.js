import EventEmitter from 'events'
import { Test, Suite } from '../Data.js'

/**
 * Limitations:
 *  - Errors in afterAll are ignored.
 */
export default class JasmineAdapter extends EventEmitter {
  constructor (jasmine) {
    super()
    this.jasmine = jasmine
    jasmine.addReporter({
      jasmineStarted: this.onJasmineStarted.bind(this),
      specDone: this.onSpecDone.bind(this),
      specStarted: this.onSpecStarted.bind(this),
      suiteStarted: this.onSuiteStarted.bind(this),
      suiteDone: this.onSuiteDone.bind(this),
      jasmineDone: this.onJasmineDone.bind(this)
    })

    this.suites = {}
    this.tests = {}
  }

  createSuiteStart (suite) {
    return new Suite(
      suite.name,
      suite.fullName,
      suite.childSuites.map(this.createSuiteStart.bind(this)),
      suite.tests.map(this.createTestStart.bind(this))
    )
  }

  createSuiteEnd (suite) {
    return new Suite(
      suite.name,
      suite.fullName,
      suite.childSuites.map(this.createSuiteEnd.bind(this)),
      suite.tests.map(this.createTestEnd.bind(this))
    )
  }

  createTestStart (test) {
    return new Test(test.testName, test.suiteName, test.fullName)
  }

  createTestEnd (test) {
    return new Test(test.testName, test.suiteName, test.fullName,
      test.status, test.runtime, test.errors, test.assertions)
  }

  saveTestDetails (jasmineSpec) {
    var test = this.tests[jasmineSpec.id]

    test.errors = []
    test.assertions = []

    jasmineSpec.failedExpectations.forEach(function (expectation) {
      var assertion = {
        passed: false,
        actual: expectation.actual,
        expected: expectation.expected,
        message: expectation.message,
        stack: expectation.stack
      }

      test.errors.push(assertion)
      test.assertions.push(assertion)
    })

    jasmineSpec.passedExpectations.forEach(function (expectation) {
      var assertion = {
        passed: true,
        actual: expectation.actual,
        expected: expectation.expected,
        message: expectation.message,
        stack: undefined
      }

      test.assertions.push(assertion)
    })

    if (jasmineSpec.status === 'pending') {
      test.status = 'skipped'
    } else {
      test.status = jasmineSpec.status
      test.runtime = new Date() - this.startTime
    }
  }

  isJasmineGlobalSuite (suite) {
    return suite.description === 'Jasmine__TopLevel__Suite'
  }

  /**
   * Jasmine provides details about childSuites and tests only in the structure
   * returned by "this.jasmine.topSuite()".
   *
   * This function creates the global suite for the runStart event, as also
   * saves the created suites and tests compliant with the CRI standard in an
   * object using as key their unique ids provided by Jasmine.
   */
  createGlobalSuite (jasmineSuite, fullName) {
    var childSuites = []
    var tests = []
    var isGlobalSuite = this.isJasmineGlobalSuite(jasmineSuite)

    if (!isGlobalSuite) {
      fullName.push(jasmineSuite.description)
    }

    jasmineSuite.children.forEach((child) => {
      if (child.id.indexOf('suite') === 0) {
        childSuites.push(this.createGlobalSuite(child, fullName))
      } else {
        let test
        let suiteName = !isGlobalSuite ? jasmineSuite.description : undefined

        fullName.push(child.description)

        test = new Test(child.description, suiteName, fullName.slice())

        fullName.pop()

        tests.push(test)
        this.tests[child.id] = test
      }
    })

    let name = !isGlobalSuite ? jasmineSuite.description : undefined
    let suite = new Suite(name, fullName.slice(), childSuites, tests)

    this.suites[jasmineSuite.id] = suite

    fullName.pop()

    return suite
  }

  onJasmineStarted () {
    this.globalSuite = this.createGlobalSuite(this.jasmine.topSuite(), [])
    this.emit('runStart', this.createSuiteStart(this.globalSuite))
  }

  onSpecStarted (details) {
    this.startTime = new Date()
    this.emit('testStart', this.createTestStart(this.tests[details.id]))
  }

  onSpecDone (details) {
    this.saveTestDetails(details)
    this.emit('testEnd', this.createTestEnd(this.tests[details.id]))
  }

  onSuiteStarted (details) {
    this.emit('suiteStart', this.createSuiteStart(this.suites[details.id]))
  }

  onSuiteDone (details) {
    this.emit('suiteEnd', this.createSuiteEnd(this.suites[details.id]))
  }

  onJasmineDone () {
    this.emit('runEnd', this.createSuiteEnd(this.globalSuite))
  }
}
