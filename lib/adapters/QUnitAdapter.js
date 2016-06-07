import EventEmitter from 'events'
import { Test, Suite } from '../Data.js'

export default class QUnitAdapter extends EventEmitter {
  constructor (QUnit) {
    super()
    this.QUnit = QUnit
    QUnit.begin(this.onBegin.bind(this))
    QUnit.testStart(this.onTestStart.bind(this))
    QUnit.log(this.onLog.bind(this))
    QUnit.testDone(this.onTestDone.bind(this))
    QUnit.done(this.onDone.bind(this))

    this.testsDetails = {}
    this.type = {
      START: 'S',
      END: 'E'
    }
  }

  convertModule (qunitModule) {
    var tests = []

    for (let qunitTest of qunitModule.tests) {
      var test = new Test(qunitTest.name, qunitModule.name.replace(/> /g, ''))

      // Put the testId on the test to find the its details later.
      test.testId = qunitTest.testId
      tests.push(test)
    }

    return new Suite(qunitModule.name, [], tests)
  }

  saveTestDetails (qunitTest) {
    var testDetails = {}

    testDetails.errors = this.errors

    if (qunitTest.failed > 0) {
      testDetails.status = 'failed'
    } else if (qunitTest.skipped) {
      testDetails.status = 'skipped'
    } else {
      testDetails.status = 'passed'
    }

    // Workaround for QUnit skipped tests runtime which is a Number.
    if (testDetails.status !== 'skipped') {
      testDetails.runtime = qunitTest.runtime
    } else {
      testDetails.runtime = undefined
    }

    this.testsDetails[qunitTest.testId] = testDetails
  }

  createGlobalSuite () {
    var topLevelSuites = []
    var suites = []
    var globalSuite
    var modules
    var indexStart, indexEnd

    // Access QUnit internals to get all suites and tests, working around
    // missing event data.

    // Create the global suite first.
    if (this.QUnit.config.modules.length > 0 &&
        this.QUnit.config.modules[0].name === '') {
      globalSuite = this.convertModule(this.QUnit.config.modules[0])
      globalSuite.name = undefined

      // The global tests suiteName must be undefined.
      for (let test of globalSuite.tests) {
        test.suiteName = undefined
      }

      modules = this.QUnit.config.modules.slice(1)
    } else {
      globalSuite = new Suite(undefined, [], [])
      modules = this.QUnit.config.modules
    }

    // Build a list with all suites.
    for (let module of modules) {
      suites.push(this.convertModule(module))
    }

    // Iterate through the whole suites and check if they have composed names,
    // like "suiteName1 > suiteName2 > ... > suiteNameN".
    //
    // If a suite has a composed name, its name will be the last in the sequence
    // and its parent name will be the one right before it. Search the parent
    // suite after its name and then add the suite with the composed name to the
    // childSuites.
    //
    // If a suite does not have a composed name, add it to the topLevelSuites,
    // this means that this suite is the direct child of the global suite.
    for (let suite of suites) {
      indexEnd = suite.name.lastIndexOf('>')

      if (indexEnd !== -1) {
        // Escape the '>' character and the space before it.
        indexEnd = indexEnd - 1
        // Find the '>' character that appears before the parent name.
        indexStart = suite.name.substring(0, indexEnd).lastIndexOf('>')
        // If it is -1, the parent suite name starts at 0, else escape the
        // '>' character and the space after it.
        indexStart = (indexStart === -1) ? 0 : indexStart + 2

        var parentSuiteName = suite.name.substring(indexStart, indexEnd)

        // Keep only the name of the suite itself.
        suite.name = suite.name.substring(indexEnd + 3)

        for (let parentSuite of suites) {
          if (parentSuite.name === parentSuiteName) {
            parentSuite.childSuites.push(suite)
          }
        }
      } else {
        topLevelSuites.push(suite)
      }
    }

    globalSuite.childSuites = topLevelSuites

    return globalSuite
  }

  createSuite (suite, type) {
    var childSuites = []
    var tests = []

    for (let childSuite of suite.childSuites) {
      childSuites.push(this.createSuite(childSuite, type))
    }

    for (let test of suite.tests) {
      tests.push(this.createTest(test, type))
    }

    return new Suite(suite.name, childSuites, tests)
  }

  createTest (test, type) {
    switch (type) {
      case this.type.START: {
        return new Test(test.testName, test.suiteName)
      }
      case this.type.END: {
        var testDetails = this.testsDetails[test.testId]

        return new Test(test.testName, test.suiteName, testDetails.status,
          testDetails.runtime, testDetails.errors)
      }
      default: {
        throw new Error('Unknown test type')
      }
    }
  }

  emitData (suite) {
    for (let test of suite.tests) {
      this.emit('testStart', this.createTest(test, this.type.START))
      this.emit('testEnd', this.createTest(test, this.type.END))
    }

    for (let suite of suite.childSuites) {
      this.emit('suiteStart', this.createSuite(suite, this.type.START))
      this.emitData(suite)
      this.emit('suiteEnd', this.createSuite(suite, this.type.END))
    }
  }

  onBegin () {
    this.globalSuite = this.createGlobalSuite()
  }

  onTestStart (details) {
    this.errors = []
  }

  onLog (details) {
    if (!details.result) {
      this.errors.push(details)
    }
  }

  onTestDone (details) {
    this.saveTestDetails(details)
  }

  onDone () {
    this.emit('runStart', this.createSuite(this.globalSuite, this.type.START))
    this.emitData(this.globalSuite)
    this.emit('runEnd', this.createSuite(this.globalSuite, this.type.END))
  }
}
