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

    if (test.status === 'passed') {
      console.log(`ok ${this.testCount} ${test.fullName.join(' > ')}`)
    } else if (test.status === 'skipped') {
      console.log(`ok ${this.testCount} # SKIP ${test.fullName.join(' > ')}`)
    } else if (test.status === 'todo') {
      console.log(`not ok ${this.testCount} # TODO ${test.fullName.join(' > ')}`)
    } else {
      console.log(`not ok ${this.testCount} ${test.fullName.join(' > ')}`)

      test.errors.forEach(function (error) {
        console.log('  ---')
        console.log(`  message: "${error.message}"`)
        console.log('  severity: failed')
        console.log(`  stack: "${error.stack}"`)
        console.log('  ...')
      })
    }
  }

  onRunEnd (globalSuite) {
    console.log(`1..${globalSuite.testCounts.total}`)
    console.log(`tests ${globalSuite.testCounts.total}`)
    console.log(`pass ${globalSuite.testCounts.pass}`)
    console.log(`fail ${globalSuite.testCounts.fail}`)
    console.log(`skip ${globalSuite.testCounts.skip}`)
    console.log(`todo ${globalSuite.testCounts.todo}`)
  }
}
