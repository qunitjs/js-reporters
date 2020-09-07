const { TestEnd, TestStart, SuiteStart, SuiteEnd } = require('../../');

module.exports = {
  passingTest: new TestEnd('pass', undefined, [], 'passed', 0, []),
  failingTest: new TestEnd('fail', undefined, [], 'failed', 0, [
    new Error('first error'), new Error('second error')
  ]),
  actualUndefinedTest: new TestEnd('fail', undefined, [], 'failed', 0, [{
    passed: false,
    actual: undefined,
    expected: 'expected'
  }]),
  actualFalsyTest: new TestEnd('fail', undefined, [], 'failed', 0, [{
    passed: false,
    actual: 0,
    expected: 'expected'
  }]),
  expectedUndefinedTest: new TestEnd('fail', undefined, [], 'failed', 0, [{
    passed: false,
    actual: 'actual',
    expected: undefined
  }]),
  expectedFalsyTest: new TestEnd('fail', undefined, [], 'failed', 0, [{
    passed: false,
    actual: 'actual',
    expected: 0
  }]),
  skippedTest: new TestEnd('skip', undefined, [], 'skipped', 0, []),
  todoTest: new TestEnd('todo', undefined, [], 'todo', 0, []),
  startSuite: new SuiteStart('start', 'start', [], []),
  startTest: new TestStart('start', 'start', 'start start'),
  endTest: new TestEnd('end', 'end', 'end end', 'failed', 0,
    [new Error('error')], []),
  endSuite: new SuiteEnd('end', 'end', [], [])
};
