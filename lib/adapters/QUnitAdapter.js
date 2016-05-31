import EventEmitter from 'events'
import { Test, Suite } from '../Data.js'

export default class QUnitAdapter extends EventEmitter {
  constructor (QUnit) {
    super()
    this.QUnit = QUnit
    QUnit.begin(this.onBegin.bind(this))
    QUnit.moduleStart(this.onModuleStart.bind(this))
    QUnit.testStart(this.onTestStart.bind(this))
    QUnit.log(this.onLog.bind(this))
    QUnit.testDone(this.onTestDone.bind(this))
    QUnit.moduleDone(this.onModuleDone.bind(this))
    QUnit.done(this.onDone.bind(this))

    this.testsDetails = {}
  }

  convertModule (qunitModule) {
    var suiteName = qunitModule.name
    var tests = []

    for (let qunitTest of qunitModule.tests) {
      qunitTest.testEnd = qunitModule.suiteEnd
      tests.push(this.convertTest(qunitTest, suiteName))
    }

    return new Suite(suiteName, [], tests)
  }

  /**
   * @param qunitTest - when passed in from the convertModule function it does
   *  contain only its "name" and the "testId".
   * @param suiteNameParam - is used only when calling convertTest from
   *  the convertModule function, in rest it is undefined.
   */
  convertTest (qunitTest, suiteName) {
    // Set the suiteName only if it is undefined and it is not the name of the
    // globalModule.
    if (!suiteName && qunitTest.module !== '') {
      suiteName = qunitTest.module
    }

    // Test end.
    if (qunitTest.testEnd) {
      var testDetails = this.testsDetails[qunitTest.testId]

      if (testDetails === undefined) {
        testDetails = {}

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

        // Save test details for late use on the suiteEnd events.
        this.testsDetails[qunitTest.testId] = testDetails
      }

      return new Test(qunitTest.name, suiteName, testDetails.status,
          testDetails.runtime, testDetails.errors)
    }

    // Test start.
    return new Test(qunitTest.name, suiteName)
  }

  isGlobalModule (module) {
    return module.name === ''
  }

  onBegin () {
    var suites = []

    // Access QUnit internals to build liste of modules, working around missing event data
    for (let suite of this.QUnit.config.modules) {
      suites.push(this.convertModule(suite))
    }

    this.globalSuite = new Suite(undefined, suites, [])
    this.emit('runStart', this.globalSuite)
  }

  onModuleStart (details) {
    if (!this.isGlobalModule(details)) {
      this.emit('suiteStart', this.convertModule(details))
    }
  }

  onTestStart (details) {
    this.errors = []
    this.emit('testStart', this.convertTest(details))
  }

  onLog (details) {
    if (!details.result) {
      this.errors.push(details)
    }
  }

  onTestDone (details) {
    details.testEnd = true
    this.emit('testEnd', this.convertTest(details))
  }

  onModuleDone (details) {
    details.suiteEnd = true

    if (!this.isGlobalModule(details)) {
      this.emit('suiteEnd', this.convertModule(details))
    } else {
      this.globalEndSuite = this.convertModule(details)
    }
  }

  onDone () {
    this.emit('runEnd', this.globalEndSuite)
  }
}
