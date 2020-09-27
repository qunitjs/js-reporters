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
    suiteName: undefined,
    fullName: ['pass']
  },
  passingTest: {
    name: 'pass',
    suiteName: undefined,
    fullName: ['pass'],
    status: 'passed',
    runtime: 0,
    errors: [],
    assertions: []
  },
  failingTest: copyErrors({
    name: 'fail',
    suiteName: undefined,
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
    suiteName: undefined,
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
  actualFalsyTest: copyErrors({
    name: 'Failing',
    suiteName: undefined,
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
  expectedUndefinedTest: copyErrors({
    name: 'fail',
    suiteName: undefined,
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
    suiteName: undefined,
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
    suiteName: undefined,
    fullName: ['skip'],
    status: 'skipped',
    runtime: 0,
    errors: [],
    assertions: []
  },
  todoTest: {
    name: 'todo',
    suiteName: undefined,
    fullName: ['todo'],
    status: 'todo',
    runtime: 0,
    errors: [],
    assertions: []
  },
  suiteStart: {
    name: 'suite name',
    fullName: ['parent', 'suite name'],
    tests: [],
    childSuites: [],
    testCounts: {
      total: 2
    }
  },
  suiteEnd: {
    name: 'suite name',
    fullName: ['parent', 'suite name'],
    tests: [],
    childSuites: [],
    status: 'passed',
    testCounts: {
      passed: 2,
      failed: 0,
      skipped: 0,
      todo: 0,
      total: 2,
      extraNested: 40
    },
    extraRoot: 20
  }
};
