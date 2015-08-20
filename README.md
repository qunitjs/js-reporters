# js-reporters

The Common Reporter Interface (CRI) for JavaScript Unit Testing Frameworks

| Avoid this:                | Do this:                         |
|----------------------------|----------------------------------|
| ![](img/situation-now.png) | ![](img/situation-expected.png)  |


## Centralized Discussions

https://github.com/js-reporters/js-reporters/issues/


## Background

We on the [QUnit](http://qunitjs.com/) team have been [discussing](https://github.com/jquery/qunit/issues/531) the
possibility of working with other JS test frameworks, especially those that can be run client-side (e.g. Mocha, Jasmine,
Intern, Buster, etc.), to agree upon a "Common Reporter Interface" so that we could hopefully share Reporter plugins
between testing frameworks. This would also benefit high-level consumers of the frameworks such as Karma, BrowserStack,
SauceLabs, Testling, etc.

This would most likely come in the form of:
 - a common Reporter API/Interface, e.g.
    - an EventEmitter interface (`.on(...)`/`.off(...)`) _**OR**_ an object with standard "hook" properties
    - _maybe_ a standard-ish way to register a Reporter, e.g. `MyLib.addReporter(x)`, `MyLib.reporter = x;`, etc.
 - a minimum viable set of standardly-named events
     - an associated standard set of data/details provided for each event
 - a minimum viable set of standard test status types (e.g. pass, fail, skip, todo, pending, etc.)
 - updating all participating test frameworks to support this new common Reporter interface

Would _you_ be interested in discussing this with us further?  Please join in!


## Draft Proposal

### Event Names

Based on the discussion in [#1](https://github.com/js-reporters/js-reporters/issues/1#issuecomment-54841874), this is
the suggested _minimum_ set of event names to be triggered by a testing framework, to be consumed by reporters or other
testing tools.

 - `runStart`: Indicates the beginning of a testsuite, triggered just once.
 - `suiteStart`: Triggered at the start of each group of tests within a testsuite.
 - `testStart`: Triggered at the start of each test.
 - `testEnd`: Triggered at the end of each test.
 - `suiteEnd`:  Triggered at the end of each group of tests within a testsuite.
 - `runEnd`:  Indicates the end of a testsuite, triggered just once.

These only define event names, not the data associated with each event. The data still needs to be specified via further
discussion in [#1](https://github.com/js-reporters/js-reporters/issues/1).

#### Selection Criteria

The criteria for picking these event names included:

 - These use the most common terms across a selection of frameworks, as gathered in
   [#1](https://github.com/js-reporters/js-reporters/issues/1#issuecomment-54841874)
 - It uses names that are valid JavaScript identifiers, which allows using those as keys in JSON and avoids the need to
   quote keys in regular JS objects or function calls.
 - It doesn't overlap with any known existing events, so introducing these could be done in parallel to the existing API
   in each framework, optionally deprecating and eventually removing the previous API.

### Event Data

Based on the discussion in [#12](https://github.com/js-reporters/js-reporters/issues/12#issuecomment-120483356), there
are two basic data structures: Suites and Tests. A test represents an atomic test/spec/"`it()`". A suite contains tests
and optionally other suites. This can represent both flat structures like used by QUnit as well as nested suites like
used by Jasmine or Mocha. The data structures are defined as follows:

 - **Test**: A test holds basic information on a single test/spec. It has the following set of required attributes
   - `testName`: name of the test
   - `suiteName`: name of the suite the test belongs to
   - `status`: result of the test. Can `passed`, `failed` or `skipped`
   - `runtime`: execution time in milliseconds
   - `errors`: array containing all errors. Depending on the framework, this is a single exception or a list of failed
     assertions. Will be empty for statuses other than failed.
 - **Suite**: A suite is a collection of tests and potentially other suites.
   - `name`: name of the suite
   - `childSuites`: array with all direct subsuites
   - `tests`: array containing all tests that directly belong to the suite (but not to a child suite)
   - `runtime`: execution time of the whole suite in milliseconds (including child suites)
   - `status`: summarized status of the suite
      - `failed`, if at least one test failed
      - `skipped`, if all tests in the suite are skipped (and there is at least one skipped test)
      - `passed`, if there is at least one passed test and all other tests are skipped or if there are no tests in the
        suite.
 
For `testStart` and `testEnd`, the corresponding test object is passed to the reporter.  The same applies to
`suiteStart` and `suiteEnd` where the matching suite object is passed to the reporter. For `runStart` and `runEnd` a
"global" suite object is passed to the reporter, which contains all top-level suites as child suites.

When `runStart`, `suiteStart` and `testStart` are emitted, the `status`, `runtime` and `errors` attributes are
`undefined`.

## Cross-Reference Issues

### Unit Testing Frameworks

 - https://github.com/jquery/qunit/issues/531  (original discussion)
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
