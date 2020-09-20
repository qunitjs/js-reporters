/* global QUnit */

// Add dummy assertions in passing tests, as QUnit by defaul requires at least one assertion.

QUnit.test('global test', function (assert) {
  assert.ok(true);
});

QUnit.module('suite with passing test');
QUnit.test('should pass', function (assert) {
  assert.ok(true);
});

QUnit.module('suite with skipped test');
QUnit.skip('should skip', function () {

});

QUnit.module('suite with failing test');
QUnit.test('should fail', function () {
  throw new Error('error');
});

QUnit.module('suite with tests');
QUnit.test('should pass', function (assert) {
  assert.ok(true);
});
QUnit.skip('should skip', function () {

});
QUnit.test('should fail', function () {
  throw new Error('error');
});

QUnit.module('outter suite', function () {
  QUnit.module('inner suite', function () {
    QUnit.test('inner test', function (assert) {
      assert.ok(true);
    });
  });

  QUnit.test('outter test', function (assert) {
    assert.ok(true);
  });
});
