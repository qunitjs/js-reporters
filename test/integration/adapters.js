/* eslint-env qunit */
/* eslint-disable no-unused-expressions */

const { test } = QUnit;
const runAdapters = require('./adapters-run.js');

function rerequire (file) {
  const resolved = require.resolve(file);
  delete require.cache[resolved];
  return require(resolved);
}

/**
 * Collect data from an (adapted) runner.
 */
function collectDataFromRunner (collectedData, done, runner) {
  runner.on('runStart', (runStart) => {
    collectedData.push(['runStart', runStart]);
  });
  runner.on('testStart', (testStart) => {
    collectedData.push(['testStart', testStart]);
  });
  runner.on('testEnd', (testEnd) => {
    normalizeTestEnd(testEnd);
    collectedData.push(['testEnd', testEnd]);
  });
  runner.on('runEnd', (runEnd) => {
    normalizeRunEnd(runEnd);
    collectedData.push(['runEnd', runEnd]);

    // Notify the integration test to continue, and validate the collected data.
    done();
  });
}

function normalizeTestEnd (test) {
  // Replace any actual assertion runtime with hardcoded 42s.
  // Preserve absence or other weird values as-is.
  if (Number.isFinite(test.runtime)) {
    test.runtime = 42;
  }

  // Only check the "passed" property.
  // Throw away the rest of the actual assertion objects as being framework-specific.
  if (test.assertions) {
    test.assertions.forEach(assertion => {
      Object.keys(assertion).forEach(key => {
        if (key !== 'passed') delete assertion[key];
      });
    });
  }
  if (test.errors) {
    test.errors.forEach(assertion => {
      Object.keys(assertion).forEach(key => {
        if (key !== 'passed') delete assertion[key];
      });
    });
  }
}

function normalizeRunEnd (runEnd) {
  if (Number.isFinite(runEnd.runtime)) {
    runEnd.runtime = 42;
  }
}

function fixExpectedData (adapter, expectedData) {
  expectedData.forEach(([eventName, data]) => {
    if (eventName === 'testEnd') {
      // Don't expect passed assertion for testing frameworks
      // that don't record all assertions.
      if (adapter === 'Mocha' && data.status === 'passed') {
        data.assertions = [];
      }
    }
    if (eventName === 'testEnd' || eventName === 'runEnd') {
      if (Number.isFinite(data.runtime)) {
        data.runtime = 42;
      }
    }
  });
}

QUnit.module('Adapters integration', function () {
  Object.keys(runAdapters).forEach(function (adapter) {
    QUnit.module(adapter + ' adapter', hooks => {
      // Re-require for each adapter because we change the expected data.
      const expectedData = rerequire('./reference-data.js');
      fixExpectedData(adapter, expectedData);

      const collectedData = [];

      hooks.before(assert => {
        const done = assert.async();
        runAdapters[adapter](
          collectDataFromRunner.bind(null, collectedData, done)
        );
      });

      // Fist check that, overall, all expected events were emitted and in order.
      test('Emitted events names', assert => {
        assert.propEqual(
          collectedData.map(pair => pair[0]),
          expectedData.map(pair => pair[0]),
          'Event names'
        );
      });

      test('Event "testStart" data', assert => {
        const actuals = collectedData.filter(pair => pair[0] === 'testStart');
        const expecteds = expectedData.filter(pair => pair[0] === 'testStart');
        assert.propEqual(
          actuals.map(expected => expected[1].name),
          expecteds.map(pair => pair[1].name),
          'Test names'
        );
        expecteds.forEach((expected, i) => {
          assert.propEqual(
            actuals[i][1],
            expected[1],
            `Event data for testStart#${i}`
          );
        });
      });

      test('Event "testEnd" data', assert => {
        const actuals = collectedData.filter(pair => pair[0] === 'testEnd');
        const expecteds = expectedData.filter(pair => pair[0] === 'testEnd');
        assert.propEqual(
          actuals.map(expected => expected[1].name),
          expecteds.map(pair => pair[1].name),
          'Test names'
        );
        expecteds.forEach((expected, i) => {
          assert.propEqual(
            actuals[i][1],
            expected[1],
            `Event data for testEnd#${i}`
          );
        });
      });

      test('Event "runStart" data', assert => {
        const actuals = collectedData.filter(pair => pair[0] === 'runStart');
        expectedData.filter(pair => pair[0] === 'runStart').forEach((expected, i) => {
          assert.propEqual(
            actuals[i][1],
            expected[1],
            `Event data for runStart#${i}`
          );
        });
      });

      test('Event "runEnd" data', assert => {
        const actuals = collectedData.filter(pair => pair[0] === 'runEnd');
        expectedData.filter(pair => pair[0] === 'runEnd').forEach((expected, i) => {
          assert.propEqual(
            actuals[i][1],
            expected[1],
            `Event data for runEnd#${i}`
          );
        });
      });
    });
  });
});
