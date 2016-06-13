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
      suite.childSuites.map(this.createSuiteStart.bind(this)),
      suite.tests.map(this.createTestStart.bind(this))
    )
  }

  createSuiteEnd (suite) {
    return new Suite(
      suite.name,
      suite.childSuites.map(this.createSuiteEnd.bind(this)),
      suite.tests.map(this.createTestEnd.bind(this))
    )
  }

  createTestStart (test) {
    return new Test(test.testName, test.suiteName)
  }

  createTestEnd (test) {
    return new Test(test.testName, test.suiteName, test.status,
      test.runtime, test.errors)
  }

  saveTestDetails (jasmineSpec) {
    var test = this.tests[jasmineSpec.id]

    test.errors = jasmineSpec.failedExpectations

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
  createGlobalSuite (jasmineSuite) {
    var childSuites = []
    var tests = []

    for (let child of jasmineSuite.children) {
      if (child.id.indexOf('suite') === 0) {
        childSuites.push(this.createGlobalSuite(child))
      } else {
        let suiteName
        let test

        // Jasmine full description is of form "suite1 suite2 ... suiteN test",
        // for the "suiteName" property we need to remove test name.
        if (!this.isJasmineGlobalSuite(jasmineSuite)) {
          suiteName = child.result.fullName.substring(
            0, child.result.fullName.indexOf(child.description) - 1
          )
        }

        test = new Test(child.description, suiteName)

        tests.push(test)
        this.tests[child.id] = test
      }
    }

    let name = (this.isJasmineGlobalSuite(jasmineSuite)) ? undefined
      : jasmineSuite.description
    let suite = new Suite(name, childSuites, tests)

    this.suites[jasmineSuite.id] = suite

    return suite
  }

  onJasmineStarted () {
    this.globalSuite = this.createGlobalSuite(this.jasmine.topSuite())
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
