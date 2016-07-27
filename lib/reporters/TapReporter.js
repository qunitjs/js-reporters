export default class TapReporter {
  constructor (runner) {
    this.testCount = 0

    runner.on('runStart', this.onRunStart.bind(this))
    runner.on('testEnd', this.onTestEnd.bind(this))
    runner.on('runEnd', this.onRunEnd.bind(this))
  }

  static init (runner) {
    return new TapReporter(runner)
  }

  onRunStart (globalSuite) {
    console.log('TAP version 13')
  }

  onTestEnd (test) {
    this.testCount = this.testCount + 1

    // TODO maybe switch to test.fullName
    // @see https://github.com/js-reporters/js-reporters/issues/65
    if (test.status === 'passed') {
      console.log(`ok ${this.testCount} ${test.name}`)
    } else if (test.status === 'skipped') {
      console.log(`ok ${this.testCount} ${test.name} # SKIP`)
    } else {
      console.log(`not ok ${this.testCount} ${test.name}`)

      test.errors.forEach(function (error) {
        console.log('  ---')
        console.log(`  message: "${error.toString()}"`)
        console.log('  severity: failed')
        console.log('  ...')
      })
    }
  }

  onRunEnd (globalSuite) {
    console.log(`1..${this.testCount}`)
  }
}
