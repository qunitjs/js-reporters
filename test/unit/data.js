const { TestEnd, TestStart, SuiteStart, SuiteEnd } = require('../../');

function mockStack (error) {
  error.stack = `    at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
    at require (internal/modules/cjs/helpers.js:22:18)
    at /dev/null/node_modules/mocha/lib/mocha.js:220:27
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)`;
  return error;
}

module.exports = {
  passingTest: new TestEnd('pass', undefined, [], 'passed', 0, []),
  failingTest: new TestEnd('fail', undefined, [], 'failed', 0, [
    mockStack(new Error('first error')), mockStack(new Error('second error'))
  ]),
  failingTapData: [
    `  ---
  message: first error
  severity: failed
  stack: |
        at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
        at require (internal/modules/cjs/helpers.js:22:18)
        at /dev/null/node_modules/mocha/lib/mocha.js:220:27
        at startup (internal/bootstrap/node.js:283:19)
        at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)
  ...`,
    `  ---
  message: second error
  severity: failed
  stack: |
        at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
        at require (internal/modules/cjs/helpers.js:22:18)
        at /dev/null/node_modules/mocha/lib/mocha.js:220:27
        at startup (internal/bootstrap/node.js:283:19)
        at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)
  ...`
  ],
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
