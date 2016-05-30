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
  }

  convertModule (qunitModule) {
    var suiteName = qunitModule.name
    var tests = []

    for (let qunitTest of qunitModule.tests) {
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
  convertTest (qunitTest, suiteNameParam) {
    var suiteName = suiteNameParam

    // Assign the name of the module, only if it is not the global one, then
    // leave the suiteName to be undefined.
    if (!suiteName && qunitTest.module !== '') {
      suiteName = qunitTest.module
    }

    if (qunitTest.errors !== undefined) {
      var status

      if (qunitTest.failed > 0) {
        status = 'failed'
      } else if (qunitTest.skipped) {
        status = 'skipped'
      } else {
        status = 'passed'
      }

      return new Test(qunitTest.name, suiteName, status, qunitTest.runtime,
          qunitTest.errors)

    }

    return new Test(qunitTest.name, suiteName)
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
    if (details.name !== '') {
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
    var test

    details.errors = this.errors
    test = this.convertTest(details)

    this.emit('testEnd', test)
  }

  onModuleDone (details) {
    if (details.name !== '') {
      this.emit('suiteEnd', this.convertModule(details))
    } else {
      this.globalEndSuite = this.convertModule(details)
    }
  }

  onDone () {
    this.emit('runEnd', this.globalEndSuite)
  }
}
