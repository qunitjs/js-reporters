/* eslint-env qunit */
const { test } = QUnit;
const JsReporters = require('../../index.js');

// Generally in test frameworks, a parent ends after its children
// have finished. Thus we build the tree "upwards", from the inside out.
function playUpwardRun (emitter) {
  emitter.emit('runStart', {
    name: null,
    testCounts: {
      total: 2
    }
  });
  emitter.emit('testEnd', {
    name: 'foo',
    suiteName: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite', 'foo'],
    status: 'passed',
    runtime: 42,
    errors: [],
    assertions: [
      { passed: true }
    ]
  });
  emitter.emit('testEnd', {
    name: 'bar',
    suiteName: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite', 'bar'],
    status: 'passed',
    runtime: 42,
    errors: [],
    assertions: [
      { passed: true }
    ]
  });
  emitter.emit('suiteEnd', {
    name: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite'],
    status: 'passed',
    runtime: 42
  });
  emitter.emit('suiteEnd', {
    name: 'Outer suite',
    fullName: ['Outer suite'],
    status: 'passed',
    runtime: 42
  });
  emitter.emit('runEnd', {
    name: null,
    status: 'passed',
    testCounts: {
      passed: 4,
      failed: 0,
      skipped: 0,
      todo: 0,
      total: 4
    },
    runtime: 42
  });
}

// But we support receiving events in any order,
// so test the reverse as well.
function playDownwardRun (emitter) {
  emitter.emit('runStart', {
    name: null,
    testCounts: {
      total: 2
    }
  });
  emitter.emit('suiteEnd', {
    name: 'Outer suite',
    fullName: ['Outer suite'],
    status: 'passed',
    runtime: 42
  });
  emitter.emit('suiteEnd', {
    name: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite'],
    status: 'passed',
    runtime: 42
  });
  emitter.emit('testEnd', {
    name: 'foo',
    suiteName: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite', 'foo'],
    status: 'passed',
    runtime: 42,
    errors: [],
    assertions: [
      { passed: true }
    ]
  });
  emitter.emit('testEnd', {
    name: 'bar',
    suiteName: 'Inner suite',
    fullName: ['Outer suite', 'Inner suite', 'bar'],
    status: 'passed',
    runtime: 42,
    errors: [],
    assertions: [
      { passed: true }
    ]
  });
  emitter.emit('runEnd', {
    name: null,
    status: 'passed',
    testCounts: {
      passed: 4,
      failed: 0,
      skipped: 0,
      todo: 0,
      total: 4
    },
    runtime: 42
  });
}

const expectedSummary = {
  name: null,
  tests: [
    {
      name: 'Outer suite',
      suiteName: null,
      fullName: ['Outer suite'],
      status: 'passed',
      runtime: 42,
      errors: [],
      assertions: [],
      tests: [
        {
          name: 'Inner suite',
          suiteName: 'Outer suite',
          fullName: ['Outer suite', 'Inner suite'],
          status: 'passed',
          runtime: 42,
          errors: [],
          assertions: [],
          tests: [
            {
              name: 'foo',
              suiteName: 'Inner suite',
              fullName: ['Outer suite', 'Inner suite', 'foo'],
              status: 'passed',
              runtime: 42,
              errors: [],
              assertions: [
                { passed: true }
              ],
              tests: []
            },
            {
              name: 'bar',
              suiteName: 'Inner suite',
              fullName: ['Outer suite', 'Inner suite', 'bar'],
              status: 'passed',
              runtime: 42,
              errors: [],
              assertions: [
                { passed: true }
              ],
              tests: []
            }
          ]
        }
      ]
    }
  ],
  status: 'passed',
  testCounts: {
    passed: 4,
    failed: 0,
    skipped: 0,
    todo: 0,
    total: 4
  },
  runtime: 42
};

QUnit.module('SummaryReporter', hooks => {
  let emitter, reporter;

  hooks.beforeEach(function () {
    emitter = new JsReporters.EventEmitter();
    reporter = JsReporters.SummaryReporter.init(emitter);
  });

  test('getSummary() with upward events', async assert => {
    playUpwardRun(emitter);
    assert.propEqual(
      await reporter.getSummary(),
      expectedSummary
    );
  });

  test('getSummary() with downward events', async assert => {
    playDownwardRun(emitter);
    assert.propEqual(
      await reporter.getSummary(),
      expectedSummary
    );
  });

  test('getSummary(callback)', async assert => {
    const done = assert.async();
    playUpwardRun(emitter);
    reporter.getSummary((err, summary) => {
      assert.strictEqual(err, null);
      assert.propEqual(summary, expectedSummary);
      done();
    });
  });

  test('forward "error" event', assert => {
    const done = assert.async();
    const obj = { message: 'Boo' };

    reporter.once('error', (err) => {
      assert.strictEqual(err, obj);
      done();
    });

    emitter.emit('error', obj);
  });
});
