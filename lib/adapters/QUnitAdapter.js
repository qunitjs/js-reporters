import EventEmitter from 'events'
import {Assertion, Test, Suite} from '../Data.js'

export default class QUnitAdapter extends EventEmitter {
  constructor (QUnit) {
    super()

    this.QUnit = QUnit
    this.tests = {}
    this.delim = ' > '

    QUnit.begin(this.onBegin.bind(this))
    QUnit.testStart(this.onTestStart.bind(this))
    QUnit.log(this.onLog.bind(this))
    QUnit.testDone(this.onTestDone.bind(this))
    QUnit.done(this.onDone.bind(this))
  }

  convertModule (qunitModule) {
    var fullName = qunitModule.name.split(this.delim)
      .filter((value) => value !== '')
    var childSuites = []

    return new Suite(
      qunitModule.name,
      fullName.slice(),
      childSuites,
      qunitModule.tests.map((qunitTest) => {
        let indexStart = qunitModule.name.lastIndexOf(this.delim)

        indexStart = indexStart === -1 ? 0 : indexStart + this.delim.length
        fullName.push(qunitTest.name)

        let suiteName = qunitModule.name.substring(indexStart)
        let test = new Test(qunitTest.name, suiteName, fullName.slice())

        this.tests[qunitTest.testId] = test
        fullName.pop()

        return test
      })
    )
  }

  saveTestDetails (qunitTest) {
    var test = this.tests[qunitTest.testId]

    test.errors = this.errors
    test.assertions = this.assertions

    if (qunitTest.failed > 0) {
      test.status = 'failed'
    } else if (qunitTest.skipped) {
      test.status = 'skipped'
    } else {
      test.status = 'passed'
    }

    // Workaround for QUnit skipped tests runtime which is a Number.
    if (test.status !== 'skipped') {
      test.runtime = qunitTest.runtime
    } else {
      test.runtime = undefined
    }
  }

  createGlobalSuite () {
    var topLevelSuites = []
    var globalSuite
    var modules

    // Access QUnit internals to get all suites and tests, working around
    // missing event data.

    // Create the global suite first.
    if (this.QUnit.config.modules.length > 0 &&
        this.QUnit.config.modules[0].name === '') {
      globalSuite = this.convertModule(this.QUnit.config.modules[0])
      globalSuite.name = undefined

      // The suiteName of global tests must be undefined.
      globalSuite.tests.forEach(function (test) {
        test.suiteName = undefined
      })

      modules = this.QUnit.config.modules.slice(1)
    } else {
      globalSuite = new Suite(undefined, [], [], [])
      modules = this.QUnit.config.modules
    }

    // Build a list with all suites.
    let suites = modules.map(this.convertModule.bind(this))

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
    suites.forEach((suite) => {
      let indexEnd = suite.name.lastIndexOf(this.delim)

      if (indexEnd !== -1) {
        // Find the ' > ' characters that appears before the parent name.
        let indexStart = suite.name.substring(0, indexEnd)
          .lastIndexOf(this.delim)
        // If it is -1, the parent suite name starts at 0, else escape
        // this characters ' > '.
        indexStart = (indexStart === -1) ? 0 : indexStart + this.delim.length

        var parentSuiteName = suite.name.substring(indexStart, indexEnd)

        // Keep only the name of the suite itself.
        suite.name = suite.name.substring(indexEnd + this.delim.length)

        suites.forEach(function (parentSuite) {
          if (parentSuite.name === parentSuiteName) {
            parentSuite.childSuites.push(suite)
          }
        })
      } else {
        topLevelSuites.push(suite)
      }
    })

    globalSuite.childSuites = topLevelSuites

    return globalSuite
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
    return new Test(test.name, test.suiteName, test.fullName)
  }

  createTestEnd (test) {
    return new Test(test.name, test.suiteName, test.fullName,
      test.status, test.runtime, test.errors, test.assertions)
  }

  createAssertion (qunitTest) {
    return new Assertion(qunitTest.result, qunitTest.actual,
      qunitTest.expected, qunitTest.message, qunitTest.source || undefined)
  }

  emitData (suite) {
    suite.tests.forEach((test) => {
      this.emit('testStart', this.createTestStart(test))
      this.emit('testEnd', this.createTestEnd(test))
    })

    suite.childSuites.forEach((childSuite) => {
      this.emit('suiteStart', this.createSuiteStart(childSuite))
      this.emitData(childSuite)
      this.emit('suiteEnd', this.createSuiteEnd(childSuite))
    })
  }

  onBegin () {
    this.globalSuite = this.createGlobalSuite()
  }

  onTestStart (details) {
    this.errors = []
    this.assertions = []
  }

  onLog (details) {
    if (!details.result) {
      this.errors.push(this.createAssertion(details))
    }

    this.assertions.push(this.createAssertion(details))
  }

  onTestDone (details) {
    this.saveTestDetails(details)
  }

  onDone () {
    this.emit('runStart', this.createSuiteStart(this.globalSuite))
    this.emitData(this.globalSuite)
    this.emit('runEnd', this.createSuiteEnd(this.globalSuite))
  }
}
