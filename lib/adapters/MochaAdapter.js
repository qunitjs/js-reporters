import EventEmitter from 'events'
import {Test, Suite} from '../Data.js'

export default class MochaAdapter extends EventEmitter {
  constructor (mocha) {
    super()

    this.mocha = mocha
    this.origReporter = mocha._reporter

    mocha.reporter((runner) => {
      this.runner = runner

      // eslint-disable-next-line no-unused-vars
      let origReporterInstance = new (this.origReporter.bind(this.mocha,
        this.runner))()

      runner.on('start', this.onStart.bind(this))
      runner.on('suite', this.onSuite.bind(this))
      runner.on('test', this.onTest.bind(this))
      runner.on('pending', this.onPending.bind(this))
      runner.on('fail', this.onFail.bind(this))
      runner.on('test end', this.onTestEnd.bind(this))
      runner.on('suite end', this.onSuiteEnd.bind(this))
      runner.on('end', this.onEnd.bind(this))
    })
  }

  convertSuite (mochaSuite) {
    return new Suite(
      mochaSuite.title,
      this.buildSuiteCanonicalName(mochaSuite),
      mochaSuite.suites.map(this.convertSuite.bind(this)),
      mochaSuite.tests.map(this.convertTest.bind(this))
    )
  }

  convertTest (mochaTest) {
    var suiteName
    var canonicalName

    if (!mochaTest.parent.root) {
      suiteName = mochaTest.parent.title
      canonicalName = this.buildSuiteCanonicalName(mochaTest.parent)
      // Add also the test name.
      canonicalName.push(mochaTest.title)
    } else {
      canonicalName = [mochaTest.title]
    }

    // If the test has the errors attached a "test end" must be emitted, else
    // a "test start".
    if (mochaTest.errors !== undefined) {
      var status = (mochaTest.state === undefined) ? 'skipped' : mochaTest.state

      // Test end.
      return new Test(mochaTest.title, suiteName, canonicalName, status,
          mochaTest.duration, mochaTest.errors)
    }

    // Test start.
    return new Test(mochaTest.title, suiteName, canonicalName)
  }

  /**
   * Builds an array with the names of nested suites.
   */
  buildSuiteCanonicalName (mochaSuite) {
    var canonicalName = [mochaSuite.root ? undefined : mochaSuite.title]
    var parent = mochaSuite.parent

    while (parent && !parent.root) {
      canonicalName.unshift(parent.title)
      parent = parent.parent
    }

    return canonicalName
  }

  onStart () {
    var globalSuiteStart = this.convertSuite(this.runner.suite)
    globalSuiteStart.name = undefined

    this.emit('runStart', globalSuiteStart)
  }

  onSuite (mochaSuite) {
    if (!mochaSuite.root) {
      this.emit('suiteStart', this.convertSuite(mochaSuite))
    }
  }

  onTest (mochaTest) {
    this.errors = []

    this.emit('testStart', this.convertTest(mochaTest))
  }

  /**
   * Emits the start of pending tests, because Mocha does not emit skipped tests
   * on its "test" event.
   */
  onPending (mochaTest) {
    this.emit('testStart', this.convertTest(mochaTest))
  }

  onFail (test, error) {
    this.errors.push(error)
  }

  onTestEnd (mochaTest) {
    // Save the errors on Mocha's test object, because when the suite that
    // contains this test is emitted on the "suiteEnd" event, it should contain
    // also this test with all its details (errors, status, runtime). Runtime
    // and status are already attached to the test, but the errors don't.
    mochaTest.errors = this.errors

    this.emit('testEnd', this.convertTest(mochaTest))
  }

  onSuiteEnd (mochaSuite) {
    if (!mochaSuite.root) {
      this.emit('suiteEnd', this.convertSuite(mochaSuite))
    }
  }

  onEnd () {
    var globalSuiteEnd = this.convertSuite(this.runner.suite)
    globalSuiteEnd.name = undefined

    this.emit('runEnd', globalSuiteEnd)
  }
}
