const failedAssertion = {
  passed: false
};

const passedAssertion = {
  passed: true
};

const globalTestStart = {
  name: 'global test',
  suiteName: null,
  fullName: [
    'global test'
  ]
};
const globalTestEnd = {
  name: 'global test',
  suiteName: null,
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
  ]
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
  status: 'passed',
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
  ]
};
const skippedTestEnd1 = {
  name: 'should skip',
  suiteName: 'suite with skipped test',
  fullName: [
    'suite with skipped test',
    'should skip'
  ],
  status: 'skipped',
  runtime: null,
  errors: [],
  assertions: []
};
const skippedSuiteEnd = {
  name: 'suite with skipped test',
  fullName: [
    'suite with skipped test'
  ],
  status: 'passed',
  runtime: 0
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
  ]
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
  status: 'failed',
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
  ]
};
const skippedTestEnd2 = {
  name: 'should skip',
  suiteName: 'suite with tests',
  fullName: [
    'suite with tests',
    'should skip'
  ],
  status: 'skipped',
  runtime: null,
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
  status: 'failed',
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
  ]
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
  status: 'passed',
  runtime: 42
};

const outerSuiteStart = {
  name: 'outer suite',
  fullName: [
    'outer suite'
  ]
};
const outerSuiteEnd = {
  name: 'outer suite',
  fullName: [
    'outer suite'
  ],
  status: 'passed',
  runtime: 84
};

const runStart = {
  name: null,
  testCounts: {
    total: 15
  }
};
const runEnd = {
  name: null,
  status: 'failed',
  testCounts: {
    passed: 9,
    failed: 4,
    skipped: 2,
    todo: 0,
    total: 15
  },
  runtime: 294
};

module.exports = [
  ['runStart', runStart],

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

  ['runEnd', runEnd]
];
