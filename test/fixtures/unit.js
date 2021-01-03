function mockStack (error) {
  error.stack = `    at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
    at require (internal/modules/cjs/helpers.js:22:18)
    at /dev/null/node_modules/mocha/lib/mocha.js:220:27
    at startup (internal/bootstrap/node.js:283:19)`;
  return error;
}

function copyErrors (testEnd) {
  testEnd.assertions = testEnd.errors;
  return testEnd;
}

module.exports = {
  passingTestStart: {
    name: 'pass',
    parentName: null,
    fullName: ['pass']
  },
  passingTest: {
    name: 'pass',
    parentName: null,
    fullName: ['pass'],
    status: 'passed',
    runtime: 0,
    errors: [],
    assertions: []
  },
  failingTest: copyErrors({
    name: 'fail',
    fullName: ['fail'],
    status: 'failed',
    runtime: 0,
    errors: [
      mockStack(new Error('first error')),
      mockStack(new Error('second error'))
    ],
    assertions: null
  }),
  failingTapData: [
    `  ---
  message: first error
  severity: failed
  stack: |
        at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
        at require (internal/modules/cjs/helpers.js:22:18)
        at /dev/null/node_modules/mocha/lib/mocha.js:220:27
        at startup (internal/bootstrap/node.js:283:19)
  ...`,
    `  ---
  message: second error
  severity: failed
  stack: |
        at Object.<anonymous> (/dev/null/test/unit/data.js:6:5)
        at require (internal/modules/cjs/helpers.js:22:18)
        at /dev/null/node_modules/mocha/lib/mocha.js:220:27
        at startup (internal/bootstrap/node.js:283:19)
  ...`
  ],
  actualUndefinedTest: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: undefined,
      expected: 'expected'
    }],
    assertions: null
  }),
  actualInfinity: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: Infinity,
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringChar: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'abc',
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringNum: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: '2',
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringBool: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'true',
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringOneTailLn: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'abc\n',
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringOneTailLnTap: `  ---
  message: failed
  severity: failed
  actual  : |
    abc
  expected: expected
  ...`,
  actualStringTwoTailLn: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'abc\n\n',
      expected: 'expected'
    }],
    assertions: null
  }),
  actualStringTwoTailLnTap: `  ---
  message: failed
  severity: failed
  actual  : |+
    abc
    
    
  expected: expected
  ...`,
  actualZero: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 0,
      expected: 'expected'
    }],
    assertions: null
  }),
  actualArray: copyErrors({
    name: 'Failing',
    parentName: null,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: [],
      expected: 'expected'
    }],
    assertions: null
  }),
  actualArrayTap: `  ---
  message: failed
  severity: failed
  actual  : []
  expected: expected
  ...`,
  expectedUndefinedTest: copyErrors({
    name: 'fail',
    parentName: null,
    fullName: [],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'actual',
      expected: undefined
    }],
    assertions: null
  }),
  expectedFalsyTest: copyErrors({
    name: 'fail',
    parentName: null,
    fullName: [],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'actual',
      expected: 0
    }],
    assertions: null
  }),
  skippedTest: {
    name: 'skip',
    parentName: null,
    fullName: ['skip'],
    status: 'skipped',
    runtime: 0,
    errors: [],
    assertions: []
  },
  todoTest: {
    name: 'todo',
    parentName: null,
    fullName: ['todo'],
    status: 'todo',
    runtime: 0,
    errors: [],
    assertions: []
  }
};
