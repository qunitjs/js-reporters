/* eslint-env qunit */
/* eslint-disable no-unused-expressions */

const { test } = QUnit;
const refData = require('./reference-data.js');
const runAdapters = require('./adapters-run.js');

// Collecting the adapter's output.
let collectedData;

function _collectOutput (eventName, done, eventData) {
  collectedData.push([eventName, eventData]);
  done();
}

/**
 * Attaches the event handler for the runner events.
 */
function _attachListeners (done, runner) {
  const dummyFunc = function () {};

  runner.on('runStart', _collectOutput.bind(null, 'runStart', dummyFunc));
  runner.on('suiteStart', _collectOutput.bind(null, 'suiteStart', dummyFunc));
  runner.on('testStart', _collectOutput.bind(null, 'testStart', dummyFunc));
  runner.on('testEnd', _collectOutput.bind(null, 'testEnd', dummyFunc));
  runner.on('suiteEnd', _collectOutput.bind(null, 'suiteEnd', dummyFunc));

  // Only when the runEnd event is emitted we can notify Mocha that we are done.
  runner.on('runEnd', _collectOutput.bind(null, 'runEnd', done));
}

/**
 * Recursively iterate over each suite and set their tests runtime to 0ms.
 */
function _setSuiteTestsRuntime (suite) {
  suite.tests.forEach(function (test) {
    if (test.status !== 'skipped') {
      test.runtime = 0;
    }
  });

  suite.childSuites.forEach(function (childSuite) {
    _setSuiteTestsRuntime(childSuite);
  });
}

/**
 * Set the suites runtime to 0 to match the runtime of the refrence suites.
 */
function _setSuitesRuntime (suite) {
  if (suite.status !== 'skipped') {
    suite.runtime = 0;
  }

  suite.childSuites.forEach(function (childSuite) {
    _setSuitesRuntime(childSuite);
  });
}

/**
 * Overwrite test assertions (for test frameworks that provide this) so that
 * they will match match those from the refrence-data file.
 */
function _overWriteTestAssertions (test) {
  test.errors.forEach(function (error) {
    error.actual = undefined;
    error.expected = undefined;
    error.message = undefined;
    error.stack = undefined;
  });

  test.assertions.forEach(function (assertion) {
    assertion.actual = undefined;
    assertion.expected = undefined;
    assertion.message = undefined;
    assertion.stack = undefined;
  });
}

/**
 * Recursively iterates over suites and overwrites tests assertions. Check
 * also _overWriteTestNormalizedAssertions function.
 */
function _overWriteSuitesAssertions (suite) {
  suite.tests.forEach(function (test) {
    _overWriteTestAssertions(test);
  });

  suite.childSuites.forEach(function (childSuite) {
    _overWriteSuitesAssertions(childSuite);
  });
}

/**
 * Fills the assertions and error properties with assertions so that they will
 * match with those from the data-refrence file, also as content as also as
 * number of contained assertions.
 */
function _fillTestAssertions (refTest, test) {
  test.assertions = [];
  test.errors = [];

  refTest.assertions.forEach(function (assertion) {
    test.assertions.push(assertion);
  });

  refTest.errors.forEach(function (error) {
    test.errors.push(error);
  });
}

/**
 * Recursively iterates over suites and fills with assertions. Check also
 * _fillTestAssertins function.
 */
function _fillSuiteAssertions (refSuite, suite) {
  refSuite.tests.forEach(function (refTest, index) {
    _fillTestAssertions(refTest, suite.tests[index]);
  });

  refSuite.childSuites.forEach(function (childSuite, index) {
    _fillSuiteAssertions(childSuite, suite.childSuites[index]);
  });
}

/**
 * Counts tests for the "suiteStart" and "runStart" event.
 */
function getTestCountsStart (refSuite) {
  const testCounts = {
    total: refSuite.tests.length
  };

  refSuite.childSuites.forEach(function (childSuite) {
    testCounts.total += getTestCountsStart(childSuite).total;
  });

  return testCounts;
}

/**
 * Counts tests for the "suiteEnd" and "runEnd" event.
 */
function getTestCountsEnd (refSuite) {
  const testCounts = {
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    total: refSuite.tests.length
  };

  testCounts.passed += refSuite.tests.filter(test => test.status === 'passed').length;
  testCounts.failed += refSuite.tests.filter(test => test.status === 'failed').length;
  testCounts.skipped += refSuite.tests.filter(test => test.status === 'skipped').length;
  testCounts.todo += refSuite.tests.filter(test => test.status === 'todo').length;

  refSuite.childSuites.forEach(function (childSuite) {
    const childTestCounts = getTestCountsEnd(childSuite);

    testCounts.passed += childTestCounts.passed;
    testCounts.failed += childTestCounts.failed;
    testCounts.skipped += childTestCounts.skipped;
    testCounts.todo += childTestCounts.todo;
    testCounts.total += childTestCounts.total;
  });

  return testCounts;
}

QUnit.module('Adapters integration', function () {
  Object.keys(runAdapters).forEach(function (adapter) {
    QUnit.module(adapter + ' adapter', hooks => {
      const keys = ['passed', 'actual', 'expected', 'message', 'stack', 'todo'];

      hooks.before(assert => {
        const done = assert.async();
        collectedData = [];
        runAdapters[adapter](_attachListeners.bind(null, done));
      });

      test('Event "testEnd" runtime property', assert => {
        collectedData.forEach(value => {
          if (value[0] === 'testEnd' && value[1].status !== 'skipped') {
            assert.equal(typeof value[1].runtime, 'number');
          }
        });
      });

      test('Event "testEnd" errors property', assert => {
        const refTestsEnd = refData.filter(value => value[0] === 'testEnd');
        const testsEnd = collectedData.filter(value => value[0] === 'testEnd');

        refTestsEnd.forEach((value, index) => {
          const refTest = value[1];
          const test = testsEnd[index][1];

          if (refTest.status === 'passed' || refTest.status === 'skipped') {
            assert.deepEqual(test.errors, refTest.errors);
          } else {
            assert.equal(test.errors.length, refTest.errors.length);

            test.errors.forEach(error => {
              assert.deepEqual(Object.keys(error), keys);

              assert.false(error.passed);
              assert.strictEqual(typeof error.message, 'string');
              assert.strictEqual(typeof error.stack, 'string');
            });
          }
        });
      });

      test('Event "testEnd" assertions property', assert => {
        const refTestsEnd = refData.filter(value => value[0] === 'testEnd');
        const testsEnd = collectedData.filter(value => value[0] === 'testEnd');

        refTestsEnd.forEach((value, index) => {
          const refTest = value[1];
          const test = testsEnd[index][1];

          // Expect to contain the correct number of assertions, only for
          // test frameworks that provide all assertions.
          if (adapter !== 'Mocha') {
            assert.strictEqual(test.assertions.length, refTest.assertions.length);
          }

          const passedAssertions = test.assertions.filter(assertion => assertion.passed);
          const failedAssertions = test.assertions.filter(assertion => !assertion.passed);

          passedAssertions.forEach(assertion => {
            assert.deepEqual(Object.keys(assertion), keys);

            assert.true(assertion.passed);
            assert.strictEqual(typeof assertion.message, 'string');
            assert.strictEqual(assertion.stack, undefined);
          });

          failedAssertions.forEach(assertion => {
            assert.deepEqual(Object.keys(assertion), keys);

            assert.false(assertion.passed);
            assert.strictEqual(typeof assertion.message, 'string');
            assert.strictEqual(typeof assertion.stack, 'string');
          });
        });
      });

      refData.forEach((value, index) => {
        const [refEvent, refTestItem, refTestDescription] = value;

        test(refTestDescription, assert => {
          const [event, testItem] = collectedData[index];

          // Set tests runtime to 0 to match the reference tests runtime.
          if (event === 'testEnd' && testItem.status !== 'skipped') {
            collectedData[index][1].runtime = 0;
          }

          // Set suite tests runtime to 0, also for the globalSuite.
          if (event === 'suiteEnd' || event === 'runEnd') {
            _setSuiteTestsRuntime(collectedData[index][1]);
          }

          // Set assertions to match those from data-refrence file.
          if (event === 'testEnd') {
            if (adapter === 'Mocha') {
              _fillTestAssertions(refTestItem, testItem);
            } else {
              _overWriteTestAssertions(testItem);
            }
          }

          // Set assertions to match thos from the data-refrence file.
          if (event === 'suiteEnd' || event === 'runEnd') {
            if (adapter === 'Mocha') {
              _fillSuiteAssertions(refTestItem, testItem);
            } else {
              _overWriteSuitesAssertions(testItem);
            }
          }

          // Verify suite self-setting props.
          if (event === 'suiteStart' || event === 'runStart') {
            assert.strictEqual(testItem.status, undefined);
            assert.strictEqual(testItem.runtime, undefined);

            assert.deepEqual(testItem.testCounts, getTestCountsStart(refTestItem));
          }

          // Verify suite self-setting props.
          if (event === 'suiteEnd' || event === 'runEnd') {
            const refStatus = value[3];

            assert.strictEqual(testItem.status, refStatus);

            if (testItem.status !== 'skipped') {
              assert.strictEqual(typeof testItem.runtime, 'number');
              // Set suites runtime to 0, to pass the deep equal assertion.
              _setSuitesRuntime(testItem);
            } else {
              assert.strictEqual(testItem.runtime, undefined);
            }

            assert.deepEqual(testItem.testCounts, getTestCountsEnd(refTestItem));
          }

          assert.strictEqual(event, refEvent);

          // FIXME: Ref data has TestEnd#assertions as plain objects instead of Assertion objects.
          // > not ok 6 Adapters integration > Jasmine adapter > global test ends
          // actual  : assertions: [ Assertion { passed: true, … } ]
          // expected: assertions: [ { passed: true, … } ]
          // assert.deepEqual(testItem, refTestItem);
          assert.propEqual(testItem, refTestItem);
        });
      });
    });
  });
});
