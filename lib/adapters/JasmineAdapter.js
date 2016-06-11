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

    // Map internal jasmine ids to standardized test/suite objects.
    this.idDataMap = {}
    this.suites = {}
    this.tests = {}
  }

  /**
   * Recursively converts a jasmine suite into a standardized suite.
   */
  convertSuite (jasmineSuite) {
    var name = jasmineSuite.description
    var childSuites = []
    var tests = []
    for (let child of jasmineSuite.children) {
      // a child can be either a suite or a spec. We use the id to distinguish between the two.
      if (child.id.indexOf('suite') === 0) {
        childSuites.push(this.convertSuite(child))
      } else {
        tests.push(this.convertSpec(child))
      }
    }
    var suite = new Suite(name, childSuites, tests)

    this.idDataMap[jasmineSuite.id] = suite

    return suite
  }

  /**
   * Converts a jasmine spec into a standardized test.
   */
  convertSpec (jasmineSpec) {
    var testName = jasmineSpec.description
    var suiteName = jasmineSpec.result.fullName

    // Jasmine only provides a concatenated suiteName + testName string.
    // Remove the testName from the string.
    if (suiteName.lastIndexOf(testName) === suiteName.length - testName.length) {
      suiteName = suiteName.substr(0, suiteName.length - testName.length - 1)
    }

    var testDetails = this.testsDetails[jasmineSpec.id]

    if (testDetails !== undefined) {

    }

    var test = new Test(
      testName,
      suiteName
    )

    this.idDataMap[jasmineSpec.id] = test

    return test
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
        let suiteName = (this.isJasmineGlobalSuite(jasmineSuite)) ? undefined :
          jasmineSuite.description
        let test = new Test(child.description, suiteName)

        tests.push(test)
        this.tests[child.id] = test
      }
    }

    let name = (this.isJasmineGlobalSuite(jasmineSuite)) ? undefined :
      jasmineSuite.description
    let suite = new Suite(name, childSuites, tests)
    this.suites[jasmineSuite.id] = suite

    return suite
  }

  onJasmineStarted () {
    this.emit('runStart', this.createGlobalSuite(this.jasmine.topSuite()))
  }

  onSpecStarted (details) {
    this.startTime = new Date()
    this.emit('testStart', this.tests[details.id])
  }

  onSpecDone (details) {
    var test = this.tests[details.id]
    test.runtime = new Date() - this.startTime
    test.errors = details.failedExpectations
    if (details.status === 'pending') {
      test.status = 'skipped'
    } else {
      test.status = details.status
    }

    this.emit('testEnd', test)
  }

  onSuiteStarted (details) {
    this.emit('suiteStart', this.suites[details.id])
  }

  onSuiteDone (details) {
    this.emit('suiteEnd', this.suites[details.id])
  }

  onJasmineDone () {
    this.emit('runEnd', this.createGlobalSuite(this.jasmine.topSuite()))
  }
}
