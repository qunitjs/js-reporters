# js-reporters

[![Build Status](https://travis-ci.org/js-reporters/js-reporters.svg?branch=master)](https://travis-ci.org/js-reporters/js-reporters)
[![npm](https://img.shields.io/npm/dm/js-reporters.svg)](https://www.npmjs.com/package/js-reporters)
[![npm](https://img.shields.io/npm/v/js-reporters.svg)](https://www.npmjs.com/package/js-reporters)
[![npm](https://img.shields.io/npm/l/js-reporters.svg?maxAge=2592000)](https://www.npmjs.com/package/js-reporters)

The Common Reporter Interface (CRI) for JavaScript Testing Frameworks.

| Avoid this:                | Do this:                         |
|----------------------------|----------------------------------|
| ![](img/situation-now.png) | ![](img/situation-expected.png)  |


## Background

In 2014, the [QUnit](https://qunitjs.com/) team started [discussing](https://github.com/qunitjs/qunit/issues/531) the possibility of interoperability between JavaScript test frameworks such as QUnit, Mocha, Jasmine, Intern, Buster, etc. The "Common Reporter Interface" would be an allow integrations for output formats and communication bridges to be shared between frameworks. This would also benefit high-level consumers of these frameworks such as Karma, BrowserStack, SauceLabs, Testling, by having a standard machine-readable interface.

Our mission is to deliver:

- a common JavaScript API, e.g. based on EventEmitter featuring `.on()` and `.off()`.
- a minimum viable set of events with standardized event names and event data.
- a minimum viable set of concepts behind those events to allow consumers to set expectations (e.g. define what "pass", "fail", "skip", "todo", and "pending" mean).
- work with participating test frameworks to support the Common Reporter Interface.

Would _you_ be interested in discussing this with us further? Please join in!

https://github.com/js-reporters/js-reporters/issues/

## Specification

See [CRI Specification](docs/cri-draft.md).

### Details

For details please check out the [docs](docs/) and especially the [example](docs/example.md) which presents a testsuite and its reporting data based on the standard presented above.

For implementation examples please check [Usage of the adapters](#usage-of-the-adapters) and [Integrations](#integrations).

## Usage

Listen to the events and receive the emitted data:

```js
// Attach one of the exiting adapters.
const runner = JsReporters.autoRegister();

// Listen to the same events for any testing framework.
runner.on('testEnd', function(test) {
  console.log('Test %s has errors:', test.fullname.join(' '), test.errors);
});

runner.on('runEnd', function(globalSuite) {
  const testCounts = globalSuite.testCounts;

  console.log('Testsuite status: %s', globalSuite.status);

  console.log('Total %d tests: %d passed, %d failed, %d skipped',
    testCounts.total,
    testCounts.passed,
    testCounts.failed,
    testCounts.skipped);

  console.log('Total duration: %d', globalSuite.runtime);
});

// Or use one of the built-in reporters.
JsReporters.TapReporter.init(runner);
```

### API

**autoRegister()**

Auto registers one of the existing adapters by checking for existing testing frameworks in the global scope and returns the runner to attach event listeners. If no framework is found, it will throw an `Error`.

```js
JsReporters.autoRegister();
```

## Integrations

- [browserstack-runner](https://github.com/browserstack/browserstack-runner/blob/master/lib/_patch/reporter.js)

## Differences

This section is dedicated to explain the limitations of the adapters in respect to the standard.

The only limitation is the emitting order, which is not done in source order:

- Jasmine: the emitting order of the tests will be the one from Jasmine
- Mocha: the emitting order of the tests will be the one from Mocha
- QUnit: the emitting order is done in suite order, which means if there is a suite that contains tests and other suites, it emits the start of the suite and then emits its tests and only after it emits the other suites, even if the tests were the last in source order

If you want to know more about each testing framework and about their emitting order, please checkout the [frameworks](docs/frameworks.md) document.

## Cross-Reference Issues

### Unit Testing Frameworks

- https://github.com/qunitjs/qunit/issues/531  (original discussion)
- https://github.com/visionmedia/mocha/issues/1326
- https://github.com/pivotal/jasmine/issues/659
- https://github.com/theintern/intern/issues/257
- https://github.com/busterjs/buster/issues/419
- https://github.com/caolan/nodeunit/issues/276
- https://github.com/flatiron/vows/issues/313

### Consuming Services

- https://github.com/browserstack/browserstack-runner/issues/92
- https://github.com/axemclion/grunt-saucelabs/issues/164
- https://github.com/karma-runner/karma/issues/1183
- https://github.com/substack/testling/issues/93
