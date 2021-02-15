const tape = require('tape');

tape.test('global test', function (t) {
  t.ok(true);
  t.end();
});

tape.test('suite with passing test', function (t) {
  t.test('should pass', function (t) {
    t.ok(true);
    t.end();
  });
  t.end();
});

tape.test('suite with skipped test', function (t) {
  t.skip('should skip', function (t) {
    t.end();
  });
  t.end();
});

tape.test('suite with failing test', function (t) {
  t.test('should fail', function (t) {
    t.fail(new Error('error'));
    t.end();
  });
  t.end();
});

tape.test('suite with tests', function (t) {
  t.test('should pass', function (t) {
    t.ok(true);
    t.end();
  });
  t.test('should skip', { skip: true }, function (t) {
    t.end();
  });
  t.test('should fail', function (t) {
    t.fail(new Error('error'));
    t.end();
  });
  t.end();
});

tape.test('outer suite', function (t) {
  t.test('outer test', function (t) {
    t.ok(true);
    t.end();
  });

  t.test('inner suite', function (t) {
    t.test('inner test', function (t) {
      t.ok(true);
      t.end();
    });
    t.end();
  });
  t.end();
});
