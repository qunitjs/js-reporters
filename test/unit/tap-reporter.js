/* eslint-env qunit */
const { test } = QUnit;
const kleur = require('kleur');
const sinon = require('sinon');
const JsReporters = require('../../index.js');
const data = require('../fixtures/unit.js');

QUnit.module('TapReporter', hooks => {
  let emitter, sandbox, spy;

  hooks.beforeEach(function () {
    emitter = new JsReporters.EventEmitter();
    sandbox = sinon.sandbox.create();
    spy = sandbox.stub();
    // eslint-disable-next-line no-new
    new JsReporters.TapReporter(emitter, {
      log: spy
    });
  });

  hooks.afterEach(function () {
    sandbox.restore();
  });

  test('output the TAP header', assert => {
    emitter.emit('runStart', {});

    assert.true(spy.calledOnce);
  });

  test('output ok for a passing test', assert => {
    const expected = 'ok 1 pass';

    emitter.emit('testEnd', data.passingTest);

    assert.true(spy.calledWith(expected));
  });

  test('output ok for a skipped test', assert => {
    const expected = kleur.yellow('ok 1 # SKIP skip');

    emitter.emit('testEnd', data.skippedTest);

    assert.true(spy.calledWith(expected));
  });

  test('output not ok for a todo test', assert => {
    const expected = kleur.cyan('not ok 1 # TODO todo');

    emitter.emit('testEnd', data.todoTest);

    assert.true(spy.calledWith(expected));
  });

  test('output not ok for a failing test', assert => {
    const expected = kleur.red('not ok 1 fail');

    emitter.emit('testEnd', data.failingTest);

    assert.true(spy.calledWith(expected));
  });

  test('output all errors for a failing test', assert => {
    emitter.emit('testEnd', data.failingTest);
    for (let i = 0; i < data.failingTapData.length; i++) {
      assert.true(spy.calledWith(data.failingTapData[i]));
    }
  });

  test('output global failure (string)', assert => {
    emitter.emit('error', 'Boo');

    assert.true(spy.calledWith('Bail out! Boo'));
  });

  test('output global failure (Error)', assert => {
    const err = new ReferenceError('Boo is not defined');
    err.stack = `ReferenceError: Boo is not defined
    at foo (foo.js:1:2)
    at bar (bar.js:1:2)`;
    emitter.emit('error', err);

    assert.true(spy.calledWith(`  ---
  stack: |
    ReferenceError: Boo is not defined
        at foo (foo.js:1:2)
        at bar (bar.js:1:2)
  ...`));
    assert.true(spy.calledWith('Bail out! ReferenceError: Boo is not defined'));
  });

  test('output actual assertion value of undefined', assert => {
    emitter.emit('testEnd', data.actualUndefinedTest);
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: undefined$/m));
  });

  test('output actual assertion value of Infinity', assert => {
    emitter.emit('testEnd', data.actualInfinity);
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: Infinity$/m));
  });

  test('output actual assertion value of "abc"', assert => {
    emitter.emit('testEnd', data.actualStringChar);
    // No redundant quotes
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: abc$/m));
  });

  test('output actual assertion value of "abc\\n"', assert => {
    emitter.emit('testEnd', data.actualStringOneTailLn);
    assert.equal(spy.args[1][0], data.actualStringOneTailLnTap);
  });

  test('output actual assertion value of "abc\\n\\n"', assert => {
    emitter.emit('testEnd', data.actualStringTwoTailLn);
    assert.equal(spy.args[1][0], data.actualStringTwoTailLnTap);
  });

  test('output actual assertion value of "2"', assert => {
    emitter.emit('testEnd', data.actualStringNum);
    // Quotes required to disambiguate YAML value
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: "2"$/m));
  });

  test('output actual assertion value of "true"', assert => {
    emitter.emit('testEnd', data.actualStringBool);
    // Quotes required to disambiguate YAML value
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: "true"$/m));
  });

  test('output actual assertion value of 0', assert => {
    emitter.emit('testEnd', data.actualZero);
    assert.true(spy.calledWithMatch(/^ {2}actual {2}: 0$/m));
  });

  test('output actual assertion value of []', assert => {
    emitter.emit('testEnd', data.actualArray);
    assert.equal(spy.args[1][0], data.actualArrayTap);
  });

  test('output actual assertion value of a cyclical structure', assert => {
    emitter.emit('testEnd', data.actualCyclical);
    assert.equal(spy.args[1][0], data.actualCyclicalTap);
  });

  test('output actual assertion value of a subobject cyclical structure', assert => {
    emitter.emit('testEnd', data.actualSubobjectCyclical);
    assert.equal(spy.args[1][0], data.actualSubobjectCyclicalTap);
  });

  test('output actual assertion value of an acyclical structure', assert => {
    emitter.emit('testEnd', data.actualDuplicateAcyclic);
    assert.equal(spy.args[1][0], data.actualDuplicateAcyclicTap);
  });

  test('output expected assertion of undefined', assert => {
    emitter.emit('testEnd', data.expectedUndefinedTest);
    assert.true(spy.calledWithMatch(/^ {2}expected: undefined$/m));
  });

  test('output expected assertion of 0', assert => {
    emitter.emit('testEnd', data.expectedFalsyTest);
    assert.true(spy.calledWithMatch(/^ {2}expected: 0$/m));
  });

  test('output expected assertion of a circular structure', assert => {
    emitter.emit('testEnd', data.expectedCircularTest);
    assert.true(spy.calledWithMatch(/^ {2}expected: \{\n {2}"a": "example",\n {2}"cycle": "\[Circular\]"\n\}$/m));
  });

  test('output the total number of tests', assert => {
    const summary = '1..6';
    const passCount = '# pass 3';
    const skipCount = kleur.yellow('# skip 1');
    const todoCount = kleur.cyan('# todo 0');
    const failCount = kleur.red('# fail 2');

    emitter.emit('runEnd', {
      testCounts: {
        total: 6,
        passed: 3,
        failed: 2,
        skipped: 1,
        todo: 0
      }
    });

    assert.true(spy.calledWith(summary));
    assert.true(spy.calledWith(passCount));
    assert.true(spy.calledWith(skipCount));
    assert.true(spy.calledWith(todoCount));
    assert.true(spy.calledWith(failCount));
  });
});
