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

