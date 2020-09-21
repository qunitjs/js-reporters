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

  QUnit.module('create functions', function () {
    test('return a suite start', assert => {
      const startSuite = JsReporters.createSuiteStart(data.startSuite);

      assert.propEqual(startSuite, data.startSuite);
    });

    test('return a test start', assert => {
      const startTest = JsReporters.createTestStart(data.startTest);

      assert.propEqual(startTest, data.startTest);
    });

    test('return a test end', assert => {
      const endTest = JsReporters.createTestEnd(data.endTest);

      assert.propEqual(endTest, data.endTest);
    });

    test('return a suite end', assert => {
      const endSuite = JsReporters.createSuiteEnd(data.endSuite);

      assert.propEqual(endSuite, data.endSuite);
    });
  });
});
