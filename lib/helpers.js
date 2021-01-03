// TODO: Remove this function
function getAllTests (tests, childSuites) {
  return tests
    .concat(...childSuites.map(childSuite => getAllTests(childSuite.tests, childSuite.childSuites)));
}

// TODO: Remove this function
function collectSuiteStartData (tests, childSuites) {
  return {
    counts: {
      total: getAllTests(tests, childSuites).length
    }
  };
}

// TODO: Remove this function
function collectSuiteEndData (childTests, childSuites = []) {
  const all = getAllTests(childTests, childSuites);
  const counts = {
    passed: all.filter((test) => test.status === 'passed').length,
    failed: all.filter((test) => test.status === 'failed').length,
    skipped: all.filter((test) => test.status === 'skipped').length,
    todo: all.filter((test) => test.status === 'todo').length,
    total: all.length
  };
  const status = counts.failed > 0 ? 'failed' : 'passed';

  let runtime = 0;
  all.forEach((test) => {
    runtime += (test.status === 'skipped' ? 0 : test.runtime);
  });

  return {
    status,
    counts,
    runtime
  };
}

function aggregateTests (all) {
  const counts = {
    passed: all.filter((test) => test.status === 'passed').length,
    failed: all.filter((test) => test.status === 'failed').length,
    skipped: all.filter((test) => test.status === 'skipped').length,
    todo: all.filter((test) => test.status === 'todo').length,
    total: all.length
  };
  const status = counts.failed ? 'failed' : 'passed';

  let runtime = 0;
  all.forEach((test) => {
    runtime += test.runtime || 0;
  });

  return {
    status,
    counts,
    runtime
  };
}

// TODO: Remove this function
function createSuiteStart (suiteEnd) {
  const parentName = suiteEnd.fullName.slice(-2, -1)[0];
  return {
    name: suiteEnd.name,
    parentName: parentName !== undefined ? parentName : null,
    fullName: suiteEnd.fullName.slice()
  };
}

function createTestStart (testEnd) {
  return {
    name: testEnd.name,
    parentName: testEnd.parentName,
    fullName: testEnd.fullName.slice()
  };
}

module.exports = {
  collectSuiteStartData,
  collectSuiteEndData,
  aggregateTests,
  createSuiteStart,
  createTestStart
};
