var JsReporters = require('../../dist/js-reporters.js')
var Suite = JsReporters.Suite
var Test = JsReporters.Test

var globalTestStart = new Test('global test', undefined, undefined, undefined,
    undefined)
var globalTestEnd = new Test('global test', undefined, 'passed', 0, [])

var passingTestStart1 = new Test('should pass', 'suite with passing test',
    undefined, undefined, undefined)
var passingTestEnd1 = new Test('should pass', 'suite with passing test',
    'passed', 0, [])

var passingTestStart2 = new Test('should pass', 'suite with tests',
    undefined, undefined, undefined)
var passingTestEnd2 = new Test('should pass', 'suite with tests', 'passed',
    0, [])

var skippedTestStart1 = new Test('should skip', 'suite with skipped test',
    undefined, undefined, undefined)
var skippedTestEnd1 = new Test('should skip', 'suite with skipped test',
    'skipped', undefined, [])

var skippedTestStart2 = new Test('should skip', 'suite with tests',
    undefined, undefined, undefined)
var skippedTestEnd2 = new Test('should skip', 'suite with tests', 'skipped',
    undefined, [])

var failingTestStart1 = new Test('should fail', 'suite with failing test',
    undefined, undefined, undefined)
var failingTestEnd1 = new Test('should fail', 'suite with failing test', 'failed',
    0, [new Error('error')])

var failingTestStart2 = new Test('should fail', 'suite with tests',
    undefined, undefined, undefined)
var failingTestEnd2 = new Test('should fail', 'suite with tests', 'failed',
    0, [new Error('error')])

var innerTestStart = new Test('inner test', 'outter suite inner suite',
    undefined, undefined, undefined)
var innerTestEnd = new Test('inner test', 'outter suite inner suite',
    'passed', 0, [])

var outterTestStart = new Test('outter test', 'outter suite',
    undefined, undefined, undefined)
var outterTestEnd = new Test('outter test', 'outter suite', 'passed', 0, [])

var passingSuiteStart = new Suite('suite with passing test', [],
    [passingTestStart1])
var passingSuiteEnd = new Suite('suite with passing test', [],
    [passingTestEnd1])

var skippedSuiteStart = new Suite('suite with skipped test', [],
    [skippedTestStart1])
var skippedSuiteEnd = new Suite('suite with skipped test', [],
    [skippedTestEnd1])

var failingSuiteStart = new Suite('suite with failing test', [],
    [failingTestStart1])
var failingSuiteEnd = new Suite('suite with failing test', [],
    [failingTestEnd1])

var testSuiteStart = new Suite('suite with tests', [], [
  passingTestStart2,
  skippedTestStart2,
  failingTestStart2
])
var testSuiteEnd = new Suite('suite with tests', [], [
  passingTestEnd2,
  skippedTestEnd2,
  failingTestEnd2
])

var innerSuiteStart = new Suite('inner suite', [], [innerTestStart])
var innerSuiteEnd = new Suite('inner suite', [], [innerTestEnd])

var outterSuiteStart = new Suite('outter suite', [innerSuiteStart],
    [outterTestStart])
var outterSuiteEnd = new Suite('outter suite', [innerSuiteEnd],
    [outterTestEnd])

var globalSuiteStart = new Suite(undefined, [
  passingSuiteStart,
  skippedSuiteStart,
  failingSuiteStart,
  testSuiteStart,
  outterSuiteStart
], [globalTestStart])
var globalSuiteEnd = new Suite(undefined, [
  passingSuiteEnd,
  skippedSuiteEnd,
  failingSuiteEnd,
  testSuiteEnd,
  outterSuiteEnd
], [globalTestEnd])

module.exports = [
  ['runStart', globalSuiteStart, 'global suite starts'],
  ['testStart', globalTestStart, 'global test starts'],
  ['testEnd', globalTestEnd, 'global test ends'],
  ['suiteStart', passingSuiteStart, 'suite with one passing test starts'],
  ['testStart', passingTestStart1, 'passing test starts'],
  ['testEnd', passingTestEnd1, 'passing test ends'],
  ['suiteEnd', passingSuiteEnd, 'suite with one passing test ends'],
  ['suiteStart', skippedSuiteStart, 'suite with one skipped test starts'],
  ['testStart', skippedTestStart1, 'skipped test starts'],
  ['testEnd', skippedTestEnd1, 'skipped test ends'],
  ['suiteEnd', skippedSuiteEnd, 'suite with one skipped test ends'],
  ['suiteStart', failingSuiteStart, 'suite with one failing tests'],
  ['testStart', failingTestStart1, 'failing test starts'],
  ['testEnd', failingTestEnd1, 'failing test ends'],
  ['suiteEnd', failingSuiteEnd, 'suite with one failing test ends'],
  ['suiteStart', testSuiteStart, 'suite with multiple tests starts'],
  ['testStart', passingTestStart2, 'passing test starts'],
  ['testEnd', passingTestEnd2, 'passing test ends'],
  ['testStart', skippedTestStart2, 'skipped test starts'],
  ['testEnd', skippedTestEnd2, 'skipped test ends'],
  ['testStart', failingTestStart2, 'failing test starts'],
  ['testEnd', failingTestEnd2, 'failing test ends'],
  ['suiteEnd', testSuiteEnd, 'suite with multiple tests ends'],
  ['suiteStart', outterSuiteStart, 'outter suite starts'],
  ['testStart', outterTestStart, 'outter test starts'],
  ['testEnd', outterTestEnd, 'outter test ends'],
  ['suiteStart', innerSuiteStart, 'inner suite starts'],
  ['testStart', innerTestStart, 'inner test starts'],
  ['testEnd', innerTestEnd, 'inner test ends'],
  ['suiteEnd', innerSuiteEnd, 'inner suite ends'],
  ['suiteEnd', outterSuiteEnd, 'outter suite ends'],
  ['runEnd', globalSuiteEnd, 'global suite ends']
]
