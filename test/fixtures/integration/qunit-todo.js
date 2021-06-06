/* global QUnit */

QUnit.test('global pass', function (assert) {
  assert.ok(true);
});

QUnit.todo('global todo', function (assert) {
  assert.ok(false);
});

QUnit.module('suite with a todo test');
QUnit.test('should pass', function (assert) {
  assert.ok(true);
});
QUnit.todo('should todo', function (assert) {
  assert.ok(false);
});

QUnit.module.todo('todo suite');
QUnit.test('should todo', function (assert) {
  assert.ok(false);
});
