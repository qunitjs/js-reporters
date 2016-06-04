# Frameworks flow
This document is intended to explain all differences between testing frameworks and the Common Reporter Interface (CRI).

## Mocha
[Mocha](https://github.com/mochajs/mocha) is a testing framework without builtin assertions, this is why it is not checking tests
for at least one assertion, so in our Mocha specific [test fixture](https://github.com/js-reporters/js-reporters/blob/master/test/fixtures/mocha.js)
we can have empty tests.

Tests are grouped in `suites`, which can also be `nested`. Tests can be placed also outside of a suite, we call them *global tests*.

Internally Mocha wraps everything in a suite, we call it *global suite*, so the global tests will become the tests of the aformentioned 
suite, as also all other top level suites will become its direct child suites, implicitly all other suites will become its more deeper child suites, in a recursive structure. This is great for our CRI, because it is really what we need 
to emit on the *runtStart* and *runEnd* event.

Test particularities:
  * skipped tests start is not emitted by Mocha on its event *test*, but their end is emitted on *test end*
  * skipped tests do not have the `duration` property (i.e runtime) at all
  * failed tests have only one error, even if the tests contain multiple assertions, Mocha stops on the first failed assertion
  * the error of a failed test is only passed as parameter on Mocha's *fail* event, the `err` property is not availabe on the test object passed on "test end" event, it would be availabe only if you use Mocha's builtin reporters, because this property is added by their [base reporter](https://github.com/mochajs/mocha/blob/e939d8e4379a622e28064ca3a75f3e1bda7e225b/lib/reporters/base.js#L279)

Suite particularities:
  * the start and end of a suite, even the global one, are emitted only if the suite contains at least a test or a child suite (i.e nested suites) that contains a test

One interesting aspect is the execution of nested suite, which is done from the outer suite (i.e top level) to the inner most suite.

Lets take an example, to see quite all the idea explained above:

```js
describe('a', function() {
 describe('b', function() {
  it('bb', function () {});
 });
 
 describe('c', function() {
  describe('ca', function() {
   it('cc', function() {});
  });
 });
 
 describe('d', function () {
 });
 
 it('aa', function() {});
});
```
Execution flow:
 * global suite starts
 * suite *a* starts
 * test *aa* starts
 * test *aa* ends
 * suite *b* starts
 * test *bb* starts
 * test *bb* ends
 * suite *b* ends
 * suite *c* starts
 * suite *ca* starts
 * test *cc* starts
 * test *cc* ends
 * suite *ca* ends
 * suite *c* ends
 * suite *a* ends
 * global suite ends

This is the execution of the above test fixture, as you can see the `d suite` is not executed.

## QUnit

[QUnit](http://qunitjs.com/) is a testing framework with builtin assertion, so it is checking tests for at least one assertion, if it does not find one, the test will fail with an error thrown by QUnit itself.

Tests are grouped in modules, which can be also nested from [1.20.0 version](https://github.com/jquery/qunit/blob/master/History.md#1200--2015-10-27). Tests can be placed outside a module, we call them also *global tests*.

Internally QUnit has a global module, where global tests are putted, but it does not wrap the other modules into it. To emit a global suite on our *runStart/runEnd* events we must access QUnit internals, *QUnit.config.modules* which is a linear array that will contain all modules, even the nested ones.

An interesting fact of *QUnit.config.modules* is that it will not contain the *global module* if it does not have at least
one test, but it will contain all other modules, even if they do not have a test. 

Test particularities:
  * skipped tests have a numeric value for their runtime

Modules particularities:
  * the start and end of a module, even the global one, are emitted only if the suite itself contains at least one test
  * nested modules have a concatenated name, from the outer most suite to the inner most

Nested modules execution is done the following way:
  * take in order the modules inside the top level module
  * than execute them from the inner most module to the outer most

Respecting the rules above the tests in the top level suite will be the lasts that will execute.

Example:

```js
module('a', function() {
	module('b', function() {
    test('bb', function(assert) {
      assert.ok(true);
    });
  });
  
  module('c', function() {
  	module('ca', function() {
      test('cc', function(assert) {
        assert.ok(true);
      });
  	});
  });
  
  module('d', function() {
  
  });
  
  test('aa', function(assert) {
  	assert.ok(true);
  });
});
```
Execution flow:
  * module  *a > b*  starts
  * test  *bb*  starts
  * test  *bb*  ends
  * module  *a > b*  ends
  * module  *a > c > ca*  starts
  * test  *cc*  starts
  * test  *cc*  ends
  * module  *a > c > ca*  ends
  * module  *a*  starts
  * test  *aa*  starts
  * test  *aa*  ends
  * module  *a*  ends

As you can see neither the module *a > c* is not emitted for its start and end, because it does not contain a test itself.  

The *QUnit.config.modules* will contain 5 modules:
  0. module *a*
  1. module *a > b*
  2. module *a > c*
  3. module *a > c > a*
  4. module *a > d*
 
**The above execution flow is the default one**, QUnit has also 2 options that randomizes tests execution:
  1. the [reorder](http://api.qunitjs.com/QUnit.config/) option that on a rerun, runs firstly the failed tests, it is activated by default 
  2. the [seed](http://api.qunitjs.com/QUnit.config/) option that randomizes tests execution, it is disabled by default
  
**The QUnit.config.modules will always contain the suites in the same order!**
