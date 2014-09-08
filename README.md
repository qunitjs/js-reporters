# js-reporters

The Common Reporter Interface (CRI) for JavaScript Unit Testing Frameworks


## Background

We on the [QUnit](http://qunitjs.com/) team have been [discussing](https://github.com/jquery/qunit/issues/531) the possibility of working with other JS test frameworks, especially those that can be run client-side (e.g. Mocha, Jasmine, Intern, Buster, etc.), to agree upon a "Common Reporter Interface" so that we could hopefully share Reporter plugins between testing frameworks. This would also benefit high-level consumers of the frameworks such as Karma, BrowserStack, SauceLabs, Testling, etc.

This would most likely come in the form of:
 - a common Reporter API/Interface, e.g.
    - an EventEmitter interface (`.on(...)`/`.off(...)`) _**OR**_ an object with standard "hook" properties
    - _maybe_ a standard-ish way to register a Reporter, e.g. `MyLib.addReporter(x)`, `MyLib.reporter = x;`, etc.
 - a minimum viable set of standardly-named events
     - an associated standard set of data/details provided for each event
 - a minimum viable set of standard test status types (e.g. pass, fail, skip, todo, pending, etc.)
 - updating all participating test frameworks to support this new common Reporter interface

Would _you_ be interested in discussing this with us further?  Please join in!

**Centralized Discussions:** https://github.com/js-reporters/js-reporters/issues/

Cross-reference issues:
 - https://github.com/jquery/qunit/issues/531  (original discussion)
 - https://github.com/visionmedia/mocha/issues/1326
 - https://github.com/pivotal/jasmine/issues/659
 - https://github.com/theintern/intern/issues/257
 - https://github.com/busterjs/buster/issues/419
 - https://github.com/caolan/nodeunit/issues/276
 - https://github.com/flatiron/vows/issues/313
 - https://github.com/browserstack/browserstack-runner/issues/92
 - https://github.com/axemclion/grunt-saucelabs/issues/164
 - https://github.com/karma-runner/karma/issues/1183
 - https://github.com/substack/testling/issues/93
