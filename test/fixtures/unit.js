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

/**
 * Creates an object that has a cyclical reference.
 */
function createCyclical () {
  const cyclical = { a: 'example' };
  cyclical.cycle = cyclical;
  return cyclical;
}

/**
 * Creates an object that has a cyclical reference in a subobject.
 */
function createSubobjectCyclical () {
  const cyclical = { a: 'example', sub: {} };
  cyclical.sub.cycle = cyclical;
  return cyclical;
}

/**
 * Creates an object that references another object more
 * than once in an acyclical way.
 */
function createDuplicateAcyclical () {
  const duplicate = {
    example: 'value'
  };
  return {
    a: duplicate,
    b: duplicate,
    c: 'unique'
  };
}

module.exports = {
  passingTestStart: {
    name: 'pass',
    suiteName: null,
    fullName: ['pass']
  },
  passingTest: {
    name: 'pass',
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
    suiteName: null,
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
  actualCyclical: copyErrors({
    name: 'Failing',
    suiteName: undefined,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: createCyclical(),
      expected: 'expected'
    }],
    assertions: null
  }),
  actualCyclicalTap: `  ---
  message: failed
  severity: failed
  actual  : {
  "a": "example",
  "cycle": "[Circular]"
}
  expected: expected
  ...`,
  actualSubobjectCyclical: copyErrors({
    name: 'Failing',
    suiteName: undefined,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: createSubobjectCyclical(),
      expected: 'expected'
    }],
    assertions: null
  }),
  actualSubobjectCyclicalTap: `  ---
  message: failed
  severity: failed
  actual  : {
  "a": "example",
  "sub": {
    "cycle": "[Circular]"
  }
}
  expected: expected
  ...`,
  actualDuplicateAcyclic: copyErrors({
    name: 'Failing',
    suiteName: undefined,
    fullName: ['Failing'],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: createDuplicateAcyclical(),
      expected: 'expected'
    }],
    assertions: null
  }),
  actualDuplicateAcyclicTap: `  ---
  message: failed
  severity: failed
  actual  : {
  "a": {
    "example": "value"
  },
  "b": {
    "example": "value"
  },
  "c": "unique"
}
  expected: expected
  ...`,
  expectedUndefinedTest: copyErrors({
    name: 'fail',
    suiteName: null,
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
    suiteName: null,
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
  expectedCircularTest: copyErrors({
    name: 'fail',
    suiteName: undefined,
    fullName: [],
    status: 'failed',
    runtime: 0,
    errors: [{
      passed: false,
      actual: 'actual',
      expected: createCyclical()
    }],
    assertions: null
  }),
  skippedTest: {
    name: 'skip',
    suiteName: null,
    fullName: ['skip'],
    status: 'skipped',
    runtime: 0,
    errors: [],
    assertions: []
  },
  todoTest: {
    name: 'todo',
    suiteName: null,
    fullName: ['todo'],
    status: 'todo',
    runtime: 0,
    errors: [],
    assertions: []
  }
};
