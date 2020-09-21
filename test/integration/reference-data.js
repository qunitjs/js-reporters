const failedAssertion = {
  passed: false,
  actual: undefined,
  expected: undefined,
  message: undefined,
  stack: undefined,
  todo: undefined
};

const passedAssertion = {
  passed: true,
  actual: undefined,
  expected: undefined,
  message: undefined,
  stack: undefined,
  todo: undefined
};

const globalTestStart = {
  name: 'global test',
  suiteName: undefined,
  fullName: [
    'global test'
  ]
};
const globalTestEnd = {
  name: 'global test',
  suiteName: undefined,
  fullName: [
    'global test'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};

const passingTestStart1 = {
  name: 'should pass',
  suiteName: 'suite with passing test',
  fullName: [
    'suite with passing test',
    'should pass'
  ]
};
const passingSuiteStart = {
  name: 'suite with passing test',
  fullName: [
    'suite with passing test'
  ],
  tests: [
    passingTestStart1
  ],
  childSuites: [],
  testCounts: {
    total: 1
  }
};
const passingTestEnd1 = {
  name: 'should pass',
  suiteName: 'suite with passing test',
  fullName: [
    'suite with passing test',
    'should pass'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};
const passingSuiteEnd = {
  name: 'suite with passing test',
  fullName: [
    'suite with passing test'
  ],
  tests: [
    passingTestEnd1
  ],
  childSuites: [],
  status: 'passed',
  testCounts: {
    passed: 1,
    failed: 0,
    skipped: 0,
    todo: 0,
    total: 1
  },
  runtime: 42
};

const skippedTestStart1 = {
  name: 'should skip',
  suiteName: 'suite with skipped test',
  fullName: [
    'suite with skipped test',
    'should skip'
  ]
};
const skippedSuiteStart = {
  name: 'suite with skipped test',
  fullName: [
    'suite with skipped test'
  ],
  tests: [
    skippedTestStart1
  ],
  childSuites: [],
  testCounts: {
    total: 1
  }
};
const skippedTestEnd1 = {
  name: 'should skip',
  suiteName: 'suite with skipped test',
  fullName: [
    'suite with skipped test',
    'should skip'
  ],
  status: 'skipped',
  runtime: undefined,
  errors: [],
  assertions: []
};
const skippedSuiteEnd = {
  name: 'suite with skipped test',
  fullName: [
    'suite with skipped test'
  ],
  tests: [
    skippedTestEnd1
  ],
  childSuites: [],
  status: 'skipped',
  runtime: undefined,
  testCounts: {
    passed: 0,
    failed: 0,
    skipped: 1,
    todo: 0,
    total: 1
  }
};

const failingTestStart1 = {
  name: 'should fail',
  suiteName: 'suite with failing test',
  fullName: [
    'suite with failing test',
    'should fail'
  ]
};
const failingSuiteStart = {
  name: 'suite with failing test',
  fullName: [
    'suite with failing test'
  ],
  tests: [
    failingTestStart1
  ],
  childSuites: [],
  testCounts: {
    total: 1
  }
};
const failingTestEnd1 = {
  name: 'should fail',
  suiteName: 'suite with failing test',
  fullName: [
    'suite with failing test',
    'should fail'
  ],
  status: 'failed',
  runtime: 42,
  errors: [
    failedAssertion
  ],
  assertions: [
    failedAssertion
  ]
};
const failingSuiteEnd = {
  name: 'suite with failing test',
  fullName: [
    'suite with failing test'
  ],
  tests: [
    failingTestEnd1
  ],
  childSuites: [],
  status: 'failed',
  testCounts: {
    passed: 0,
    failed: 1,
    skipped: 0,
    todo: 0,
    total: 1
  },
  runtime: 42
};

const passingTestStart2 = {
  name: 'should pass',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should pass'
  ]
};
const passingTestEnd2 = {
  name: 'should pass',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should pass'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};
const skippedTestStart2 = {
  name: 'should skip',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should skip'
  ]
};
const failingTestStart2 = {
  name: 'should fail',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should fail'
  ]
};
const testSuiteStart = {
  name: 'suite with tests',
  fullName: [
    'suite with tests'
  ],
  tests: [
    passingTestStart2,
    skippedTestStart2,
    failingTestStart2
  ],
  childSuites: [],
  testCounts: {
    total: 3
  }
};
const skippedTestEnd2 = {
  name: 'should skip',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should skip'
  ],
  status: 'skipped',
  runtime: undefined,
  errors: [],
  assertions: []
};
const failingTestEnd2 = {
  name: 'should fail',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should fail'
  ],
  status: 'failed',
  runtime: 42,
  errors: [
    failedAssertion
  ],
  assertions: [
    failedAssertion
  ]
};
const testSuiteEnd = {
  name: 'suite with tests',
  fullName: [
    'suite with tests'
  ],
  tests: [
    passingTestEnd2,
    skippedTestEnd2,
    failingTestEnd2
  ],
  childSuites: [],
  status: 'failed',
  testCounts: {
    passed: 1,
    failed: 1,
    skipped: 1,
    todo: 0,
    total: 3
  },
  runtime: 84
};

const outerTestStart = {
  name: 'outer test',
  suiteName: 'outer suite',
  fullName: [
    'outer suite',
    'outer test'
  ]
};
const outerTestEnd = {
  name: 'outer test',
  suiteName: 'outer suite',
  fullName: [
    'outer suite',
    'outer test'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};
const innerTestStart = {
  name: 'inner test',
  suiteName: 'inner suite',
  fullName: [
    'outer suite',
    'inner suite',
    'inner test'
  ]
};
const innerSuiteStart = {
  name: 'inner suite',
  fullName: [
    'outer suite',
    'inner suite'
  ],
  tests: [
    innerTestStart
  ],
  childSuites: [],
  testCounts: {
    total: 1
  }
};
const innerTestEnd = {
  name: 'inner test',
  suiteName: 'inner suite',
  fullName: [
    'outer suite',
    'inner suite',
    'inner test'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};
const innerSuiteEnd = {
  name: 'inner suite',
  fullName: [
    'outer suite',
    'inner suite'
  ],
  tests: [
    innerTestEnd
  ],
  childSuites: [],
  status: 'passed',
  testCounts: {
    passed: 1,
    failed: 0,
    skipped: 0,
    todo: 0,
    total: 1
  },
  runtime: 42
};

const outerSuiteStart = {
  name: 'outer suite',
  fullName: [
    'outer suite'
  ],
  tests: [
    outerTestStart
  ],
  childSuites: [
    innerSuiteStart
  ],
  testCounts: {
    total: 2
  }
};
const outerSuiteEnd = {
  name: 'outer suite',
  fullName: [
    'outer suite'
  ],
  tests: [
    outerTestEnd
  ],
  childSuites: [
    innerSuiteEnd
  ],
  status: 'passed',
  testCounts: {
    passed: 2,
    failed: 0,
    skipped: 0,
    todo: 0,
    total: 2
  },
  runtime: 84
};

const globalSuiteStart = {
  name: undefined,
  fullName: [],
  tests: [
    globalTestStart
  ],
  childSuites: [
    passingSuiteStart,
    skippedSuiteStart,
    failingSuiteStart,
    testSuiteStart,
    outerSuiteStart
  ],
  testCounts: {
    total: 9
  }
};
const globalSuiteEnd = {
  name: undefined,
  fullName: [],
  tests: [
    globalTestEnd
  ],
  childSuites: [
    passingSuiteEnd,
    skippedSuiteEnd,
    failingSuiteEnd,
    testSuiteEnd,
    outerSuiteEnd
  ],
  status: 'failed',
  testCounts: {
    passed: 5,
    failed: 2,
    skipped: 2,
    todo: 0,
    total: 9
  },
  runtime: 294
};

module.exports = [
  ['runStart', globalSuiteStart],

  ['testStart', globalTestStart],
  ['testEnd', globalTestEnd],

  ['suiteStart', passingSuiteStart],
  ['testStart', passingTestStart1],
  ['testEnd', passingTestEnd1],
  ['suiteEnd', passingSuiteEnd],

  ['suiteStart', skippedSuiteStart],
  ['testStart', skippedTestStart1],
  ['testEnd', skippedTestEnd1],
  ['suiteEnd', skippedSuiteEnd],

  ['suiteStart', failingSuiteStart],
  ['testStart', failingTestStart1],
  ['testEnd', failingTestEnd1],
  ['suiteEnd', failingSuiteEnd],

  ['suiteStart', testSuiteStart],
  ['testStart', passingTestStart2],
  ['testEnd', passingTestEnd2],
  ['testStart', skippedTestStart2],
  ['testEnd', skippedTestEnd2],
  ['testStart', failingTestStart2],
  ['testEnd', failingTestEnd2],
  ['suiteEnd', testSuiteEnd],

  ['suiteStart', outerSuiteStart],
  ['testStart', outerTestStart],
  ['testEnd', outerTestEnd],
  ['suiteStart', innerSuiteStart],
  ['testStart', innerTestStart],
  ['testEnd', innerTestEnd],
  ['suiteEnd', innerSuiteEnd],
  ['suiteEnd', outerSuiteEnd],

  ['runEnd', globalSuiteEnd]
];
