/* eslint-env qunit */
const { test } = QUnit;
const sinon = require('sinon');
const JsReporters = require('../../index.js');

QUnit.module('ConsoleReporter', hooks => {
  let emitter, sandbox;

  hooks.before(function () {
    emitter = new JsReporters.EventEmitter();
    JsReporters.ConsoleReporter.init(emitter);
    sandbox = sinon.sandbox.create();
  });

  hooks.afterEach(function () {
    sandbox.restore();
  });

  test('Event "runStart"', assert => {
    const spy = sandbox.stub(console, 'log');
    emitter.emit('runStart', {});
    assert.equal(1, spy.callCount);
  });

  test('Event "runEnd"', assert => {
    const spy = sandbox.stub(console, 'log');
    emitter.emit('runEnd', {});
    assert.equal(1, spy.callCount);
  });

  test('Event "suiteStart"', assert => {
    const log = sandbox.stub(console, 'log');
    const group = sandbox.stub(console, 'group');
    emitter.emit('suiteStart', {});
    assert.equal(1, log.callCount);
    assert.equal(1, group.callCount);
  });

  test('Event "suiteEnd"', assert => {
    const log = sandbox.stub(console, 'log');
    const group = sandbox.stub(console, 'groupEnd');
    emitter.emit('suiteEnd', {});
    assert.equal(1, log.callCount);
    assert.equal(1, group.callCount);
  });

  test('Event "testStart"', assert => {
    const spy = sandbox.stub(console, 'log');
    emitter.emit('testStart', {});
    assert.equal(1, spy.callCount);
  });

  test('Event "testEnd"', assert => {
    const spy = sandbox.stub(console, 'log');
    emitter.emit('testEnd', {});
    assert.equal(1, spy.callCount);
  });
});
