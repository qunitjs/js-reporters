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
    // The Test needs the concatenated name of the suite only without ">".
    var suiteName = qunitModule.name.replace(/> /g, '')
    var tests = []

    for (let qunitTest of qunitModule.tests) {
      tests.push(this.convertTest(qunitTest, suiteName))
    }

    suiteName = qunitModule.name

    return new Suite(suiteName, [], tests)
  }

  /**
   * @param qunitTest - when passed in from the convertModule function it does
   *  contain only its "name" and the "testId".
   * @param suiteNameParam - is used only when calling convertTest from
   *  the convertModule function, in rest it is undefined.
   */
  convertTest (qunitTest, suiteName) {
    var testDetails = this.testsDetails[qunitTest.testId]

    // Set the suiteName only if it is undefined and it is not the name of the
    // globalModule.
    if (!suiteName && qunitTest.module !== '') {
      suiteName = qunitTest.module
    }

    // Test end.
    if (testDetails !== undefined) {
      return new Test(qunitTest.name, suiteName, testDetails.status,
          testDetails.runtime, testDetails.errors)
    }

    // Test start.
    var t = new Test(qunitTest.name, suiteName)
    t.testId = qunitTest.testId
    return t
  }

  saveTestDetails (qunitTest) {
    var testDetails = {}

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

    testDetails.errors = this.errors

    this.testsDetails[qunitTest.testId] = testDetails
  }

  isGlobalModule (module) {
    return module.name === ''
  }

  createGlobalSuite () {
    var topLevelSuites = []
    var suites = []
    var globalSuite
    var indexStart, indexEnd

    // Access QUnit internals to get all suites and tests, working around
    // missing event data.

    // Create the global suite first.
    if (this.QUnit.config.modules.length > 0 &&
        this.isGlobalModule(this.QUnit.config.modules[0])) {
      globalSuite = this.convertModule(this.QUnit.config.modules[0])
      globalSuite.name = undefined
    } else {
      globalSuite = new Suite(undefined, [], [])
    }

    // Build a list with all suites.
    for (let module of this.QUnit.config.modules) {
      if (!this.isGlobalModule(module)) {
        suites.push(this.convertModule(module))
      }
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
