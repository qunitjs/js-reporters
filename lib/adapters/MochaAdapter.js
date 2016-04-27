import EventEmitter from 'events'
import { Test, Suite } from '../Data.js'

export default class MochaAdapter extends EventEmitter {
  constructor (mocha) {
    super()

    this.mocha = mocha
    mocha.reporter((runner) => {
      this.runner = runner
      runner.on('start', this.onStart.bind(this))
      runner.on('suite', this.onSuite.bind(this))
      runner.on('test', this.onTest.bind(this))
      runner.on('fail', this.onFail.bind(this))
      runner.on('test end', this.onTestEnd.bind(this))
      runner.on('suite end', this.onSuiteEnd.bind(this))
      runner.on('end', this.onEnd.bind(this))
    })
    this.idDataMap = {}
  }

  convertSuite (mochaSuite) {
    var name = mochaSuite.title
    var childSuites = []
    var tests = []

    for (let child of mochaSuite.suites) {
      childSuites.push(this.convertSuite(child))
    }
    for (let child of mochaSuite.tests) {
      tests.push(this.convertTest(child))
    }

    var suite = new Suite(name,
      childSuites,
      tests
    )
    this.idDataMap[mochaSuite.title] = suite
    return suite
  }

  convertTest (mochaTest) {
    var testName = mochaTest.title
    var suiteName

    var parent = mochaTest.parent
    while (parent.title !== '') {
      if (suiteName === undefined) {
        suiteName = parent.title
      } else {
        suiteName = parent.title + ' ' + suiteName
      }
      parent = parent.parent
    }

    var test = new Test(
      testName,
      suiteName
    )
    this.idDataMap[mochaTest.title] = test
    return test
  }

  onStart () {
    var startSuite = this.convertSuite(this.runner.suite)
    startSuite.name = undefined
    this.idDataMap.globalSuite = startSuite

    this.emit('runStart', startSuite)
  }

  onSuite (details) {
    var suite = this.idDataMap[details.title]
    if (suite !== this.idDataMap.globalSuite) {
      this.emit('suiteStart', suite)
    }
  }

  onTest (details) {
    this.errors = []
    this.emit('testStart', this.idDataMap[details.title])
  }

  onFail (test, error) {
    this.errors.push(error)
  }

  onTestEnd (details) {
    var test = this.idDataMap[details.title]
    if (details.pending) {
      this.emit('testStart', test)
      test.status = 'skipped'
    } else {
      test.status = details.state
    }
    test.runtime = details.duration
    test.errors = this.errors

    this.emit('testEnd', test)
  }

  onSuiteEnd (details) {
    var suite = this.idDataMap[details.title]
    if (suite !== this.idDataMap.globalSuite) {
      this.emit('suiteEnd', suite)
    }
  }

  onEnd () {
    this.emit('runEnd', this.idDataMap.globalSuite)
  }
}
