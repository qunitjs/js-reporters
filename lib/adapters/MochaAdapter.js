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

    // By checking if the test has the errors attached, we know if a "test end"
    // must be emitted, or a "test start".
    if (mochaTest.errors !== undefined) {
      var status = (mochaTest.state === undefined) ? 'skipped' : mochaTest.state

      // Test end.
      return new Test(testName, suiteName, status, mochaTest.duration,
          mochaTest.errors)
    }

    // Test start.
    return new Test(testName, suiteName)
  }

  onStart () {
    var startSuite = this.convertSuite(this.runner.suite)
    startSuite.name = undefined

    this.emit('runStart', startSuite)
  }

  onSuite (details) {
    if (!details.root) {
      this.emit('suiteStart', this.convertSuite(details))
    }
  }

  onTest (details) {
    this.errors = []
    this.emit('testStart', this.convertTest(details))
  }

  onFail (test, error) {
    this.errors.push(error)
  }

  onTestEnd (details) {
    var test

    if (details.pending) {
      test = this.convertTest(details)
      this.emit('testStart', test)
    }

    // Save the errors on Mocha's test object, because when the suite that
    // contains this test is emitted on the "suiteEnd" event, it should contain
    // also this test with all its details (errors, status, runtime). Runtime
    // and status are already attached to the test, but the errors don't.
    details.errors = this.errors
    test = this.convertTest(details)

    this.emit('testEnd', test)
  }

  onSuiteEnd (details) {
    if (!details.root) {
      this.emit('suiteEnd', this.convertSuite(details))
    } else {
      this.globalSuiteEnd = details
    }
  }

  onEnd () {
    var suite = this.convertSuite(this.globalSuiteEnd)
    suite.name = undefined

    this.emit('runEnd', suite)
  }
}
