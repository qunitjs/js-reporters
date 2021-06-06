const failedAssertion = {
  passed: false
};

const passedAssertion = {
  passed: true
};

const globalPassStart = {
  name: 'global pass',
  suiteName: null,
  fullName: [
    'global pass'
  ]
};
const globalPassEnd = {
  name: 'global pass',
  suiteName: null,
  fullName: [
    'global pass'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};

const globalTodoStart = {
  name: 'global todo',
  suiteName: null,
  fullName: [
    'global todo'
  ]
};
const globalTodoEnd = {
  name: 'global todo',
  suiteName: null,
  fullName: [
    'global todo'
  ],
  status: 'todo',
  runtime: 42,
  errors: [
    failedAssertion
  ],
  assertions: [
    failedAssertion
  ]
};

const suite1Start = {
  name: 'suite with a todo test',
  fullName: [
    'suite with a todo test'
  ]
};
const passInSuite1Start = {
  name: 'should pass',
  suiteName: 'suite with a todo test',
  fullName: [
    'suite with a todo test',
    'should pass'
  ]
};
const passInSuite1End = {
  name: 'should pass',
  suiteName: 'suite with a todo test',
  fullName: [
    'suite with a todo test',
    'should pass'
  ],
  status: 'passed',
  runtime: 42,
  errors: [],
  assertions: [
    passedAssertion
  ]
};
const todoInSuite1Start = {
  name: 'should todo',
  suiteName: 'suite with a todo test',
  fullName: [
    'suite with a todo test',
    'should todo'
  ]
};
const todoInSuite1End = {
  name: 'should todo',
  suiteName: 'suite with a todo test',
  fullName: [
    'suite with a todo test',
    'should todo'
  ],
  status: 'todo',
  runtime: 42,
  errors: [
    failedAssertion
  ],
  assertions: [
    failedAssertion
  ]
};
const suite1End = {
  name: 'suite with a todo test',
  fullName: [
    'suite with a todo test'
  ],
  status: 'passed',
  runtime: 42
};

const suite2Start = {
  name: 'todo suite',
  fullName: [
    'todo suite'
  ]
};
const todoInSuite2Start = {
  name: 'should todo',
  suiteName: 'todo suite',
  fullName: [
    'todo suite',
    'should todo'
  ]
};
const todoInSuite2End = {
  name: 'should todo',
  suiteName: 'todo suite',
  fullName: [
    'todo suite',
    'should todo'
  ],
  status: 'todo',
  runtime: 42,
  errors: [
    failedAssertion
  ],
  assertions: [
    failedAssertion
  ]
};
const suite2End = {
  name: 'todo suite',
  fullName: [
    'todo suite'
  ],
  status: 'passed',
  runtime: 42
};

const runStart = {
  name: null,
  testCounts: {
    total: 7
  }
};
const runEnd = {
  name: null,
  status: 'passed',
  testCounts: {
    passed: 4,
    failed: 0,
    skipped: 0,
    todo: 3,
    total: 7
  },
  runtime: 42
};

module.exports = [
  ['runStart', runStart],

  ['testStart', globalPassStart],
  ['testEnd', globalPassEnd],

  ['testStart', globalTodoStart],
  ['testEnd', globalTodoEnd],

  ['suiteStart', suite1Start],
  ['testStart', passInSuite1Start],
  ['testEnd', passInSuite1End],
  ['testStart', todoInSuite1Start],
  ['testEnd', todoInSuite1End],
  ['suiteEnd', suite1End],

  ['suiteStart', suite2Start],
  ['testStart', todoInSuite2Start],
  ['testEnd', todoInSuite2End],
  ['suiteEnd', suite2End],

  ['runEnd', runEnd]
];
