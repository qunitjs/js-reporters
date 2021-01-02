/* eslint-env qunit */
const { test } = QUnit;
const sinon = require('sinon');
const JsReporters = require('../../index.js');

QUnit.module('ConsoleReporter', hooks => {
  let emitter, sandbox, con;

  hooks.beforeEach(function () {
    emitter = new JsReporters.EventEmitter();
    sandbox = sinon.sandbox.create();
    con = {
      log: sandbox.stub(),
      group: sandbox.stub(),
      groupEnd: sandbox.stub()
    };
    // eslint-disable-next-line no-new
    new JsReporters.ConsoleReporter(emitter, con);
  });

  hooks.afterEach(function () {
    sandbox.restore();
  });

  test('Event "runStart"', assert => {
    emitter.emit('runStart', {});
    assert.equal(con.log.callCount, 1);
  });

  test('Event "runEnd"', assert => {
    emitter.emit('runEnd', {});
    assert.equal(con.log.callCount, 1);
  });

  test('Event "suiteStart"', assert => {
    emitter.emit('suiteStart', {});
    assert.equal(con.log.callCount, 1);
    assert.equal(con.group.callCount, 1);
  });

  test('Event "suiteEnd"', assert => {
    emitter.emit('suiteEnd', {});
    assert.equal(con.log.callCount, 1);
    assert.equal(con.groupEnd.callCount, 1);
  });

  test('Event "testStart"', assert => {
    emitter.emit('testStart', {});
    assert.equal(con.log.callCount, 1);
  });

  test('Event "testEnd"', assert => {
    emitter.emit('testEnd', {});
    assert.equal(con.log.callCount, 1);
  });
});
