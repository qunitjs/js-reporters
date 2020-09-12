/* eslint-env qunit */
const { test } = QUnit;
const failingVersionsRef = require('./failing-versions.js');
const failingVersions = require('./versions-reporting.js');

QUnit.module('Versions', function () {
  test('qunit versions', assert => {
    assert.deepEqual(failingVersions.qunit, failingVersionsRef.qunit);
  });

  test('qunitjs versions', assert => {
    assert.deepEqual(failingVersions.qunitjs, failingVersionsRef.qunitjs);
  });

  test('jasmine versions', assert => {
    assert.deepEqual(failingVersions.jasmine, failingVersionsRef.jasmine);
  });

  test('mocha versions', assert => {
    assert.deepEqual(failingVersions.mocha, failingVersionsRef.mocha);
  });
});
