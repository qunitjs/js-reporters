function aggregateTests (all) {
  const testCounts = {
    passed: all.filter((test) => test.status === 'passed').length,
    failed: all.filter((test) => test.status === 'failed').length,
    skipped: all.filter((test) => test.status === 'skipped').length,
    todo: all.filter((test) => test.status === 'todo').length,
    total: all.length
  };
  const status = testCounts.failed ? 'failed' : 'passed';

  let runtime = 0;
  all.forEach((test) => {
    runtime += test.runtime || 0;
  });

  return {
    status,
    testCounts,
    runtime
  };
}

function createTestStart (testEnd) {
  return {
    name: testEnd.name,
    suiteName: testEnd.suiteName,
    fullName: testEnd.fullName.slice()
  };
}

module.exports = {
  aggregateTests,
  createTestStart
};
