module.exports = class ConsoleReporter {
  constructor (runner, options = {}) {
    // Cache references to console methods to ensure we can report failures
    // from tests tests that mock the console object itself.
    // https://github.com/js-reporters/js-reporters/issues/125
    this.log = options.log || console.log.bind(console);
    this.group = (options.log && options.group) || ('group' in console && 'groupEnd' in console
      ? console.group.bind(console)
      : () => {});
    this.groupEnd = (options.log && options.groupEnd) || ('group' in console && 'groupEnd' in console
      ? console.groupEnd.bind(console)
      : () => {});

    runner.on('runStart', this.onRunStart.bind(this));
    runner.on('suiteStart', this.onSuiteStart.bind(this));
    runner.on('testStart', this.onTestStart.bind(this));
    runner.on('testEnd', this.onTestEnd.bind(this));
    runner.on('suiteEnd', this.onSuiteEnd.bind(this));
    runner.on('runEnd', this.onRunEnd.bind(this));
  }

  static init (runner) {
    return new ConsoleReporter(runner);
  }

  onRunStart (suite) {
    this.log('runStart', suite);
  }

  onSuiteStart (suite) {
    this.group(suite.name);
    this.log('suiteStart', suite);
  }

  onTestStart (test) {
    this.log('testStart', test);
  }

  onTestEnd (test) {
    this.log('testEnd', test);
  }

  onSuiteEnd (suite) {
    this.log('suiteEnd', suite);
    this.groupEnd();
  }

  onRunEnd (globalSuite) {
    this.log('runEnd', globalSuite);
  }
};
