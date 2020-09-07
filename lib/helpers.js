const { TestStart, TestEnd, SuiteStart, SuiteEnd } = require('./Data.js');

function createSuiteStart (suite) {
  return new SuiteStart(
    suite.name,
    suite.fullName.slice(),
    suite.tests.map(createTestStart),
    suite.childSuites.map(createSuiteStart)
  );
}

function createSuiteEnd (suite) {
  return new SuiteEnd(
    suite.name,
    suite.fullName.slice(),
    suite.tests.map(createTestEnd),
    suite.childSuites.map(createSuiteEnd)
  );
}

function createTestStart (test) {
  return new TestStart(test.name, test.suiteName, test.fullName.slice());
}

function createTestEnd (test) {
  return new TestEnd(test.name, test.suiteName, test.fullName.slice(),
    test.status, test.runtime, test.errors.slice(), test.assertions.slice());
}

module.exports = {
  createSuiteStart,
  createSuiteEnd,
  createTestStart,
  createTestEnd
};
