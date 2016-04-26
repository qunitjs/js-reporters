var JsReporters = require('../dist/js-reporters.js')
var Test = JsReporters.Test
var Suite = JsReporters.Suite

var foo = new Test('foo', 'group a', 'passed', 1, [])
var bar = new Test('bar goes wrong', 'group a', 'failed', 1, [{}])
var baz = new Test('baz', 'group b', 'passed', 1, [])
var skipped = new Test('skipped test', 'group b', 'skipped', 1, [])
var subtest = new Test('subtest', 'group with subgroup subgroup', 'passed', 1, [])

var groupA = new Suite('group a', [], [foo, bar])
var groupB = new Suite('group b', [], [baz, skipped])
var subgroup = new Suite('subgroup', [], [subtest])
var parent = new Suite('group with subgroup', [subgroup], [])

// Global Suite for QUnit
var globalSuiteNoNesting = new Suite(undefined, [groupA, groupB], [])

// Global Suite for Jasmine
var globalSuiteNesting = new Suite(undefined, [groupA, groupB, parent], [])

function toStartTest (test) {
  return new Test(
    test.testName,
    test.suiteName
  )
}

function toStartSuite (suite) {
  return new Suite(
    suite.name,
    suite.childSuites.map(toStartSuite),
    suite.tests.map(toStartTest)
  )
}

var runGroupA = [
  ['suiteStart', toStartSuite(groupA)],
  ['testStart', toStartTest(foo)],
  ['testEnd', foo],
  ['testStart', toStartTest(bar)],
  ['testEnd', bar],
  ['suiteEnd', groupA]
]

var runGroupB = [
  ['suiteStart', toStartSuite(groupB)],
  ['testStart', toStartTest(baz)],
  ['testEnd', baz],
  ['testStart', toStartTest(skipped)],
  ['testEnd', skipped],
  ['suiteEnd', groupB]
]

var runParent = [
  ['suiteStart', toStartSuite(parent)],
  ['suiteStart', toStartSuite(subgroup)],
  ['testStart', toStartTest(subtest)],
  ['testEnd', subtest],
  ['suiteEnd', subgroup],
  ['suiteEnd', parent]
]

exports.Jasmine = [].concat(
  [['runStart', toStartSuite(globalSuiteNesting)]],
  runGroupA,
  runGroupB,
  runParent,
  [['runEnd', globalSuiteNesting]]
)

exports.QUnit = [].concat(
  [['runStart', toStartSuite(globalSuiteNoNesting)]],
  runGroupA,
  runGroupB,
  [['runEnd', globalSuiteNoNesting]]
)

exports.Mocha = exports.Jasmine
