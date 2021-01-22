/* eslint-env qunit */
const { test } = QUnit;
const sinon = require('sinon');
const JsReporters = require('../../index.js');
const data = require('../fixtures/unit.js');

QUnit.module('Helpers', function () {
  const dummyFunc = function () {};

  QUnit.module('autoregister', hooks => {
    hooks.beforeEach(function () {
      global.QUnit = undefined;
      global.mocha = undefined;
      global.jasmine = undefined;
    });

    hooks.afterEach(function () {
      delete global.QUnit;
      delete global.mocha;
      delete global.jasmine;
    });

    test('register the QUnitAdapter', assert => {
      global.QUnit = {
        begin: sinon.stub(),
        testStart: dummyFunc,
        log: dummyFunc,
        testDone: dummyFunc,
        done: dummyFunc
      };

      JsReporters.autoRegister();

      assert.true(global.QUnit.begin.calledOnce);
    });

    test('register the MochaAdapter', assert => {
      global.mocha = {
        reporter: sinon.stub()
      };

      JsReporters.autoRegister();

      assert.true(global.mocha.reporter.calledOnce);
    });

    test('register the JasmineAdapter', assert => {
      const spy = sinon.stub();
      global.jasmine = {
        getEnv: function () {
          return {
            addReporter: spy
          };
        }
      };

      JsReporters.autoRegister();

      assert.true(spy.calledOnce);
    });

    test('should throw an error if no testing framework was found', assert => {
      assert.throws(JsReporters.autoRegister, Error);
    });
  });

  QUnit.module('create functions', () => {
    test('return a test start', assert => {
      assert.propEqual(
        JsReporters.createTestStart(data.passingTest),
        data.passingTestStart
      );
    });
  });
});
