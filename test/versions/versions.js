/* eslint-env mocha */
const expect = require('chai').expect;
const failingVersionsRef = require('./failing-versions.js');
const failingVersions = require('./versions-reporting.js');

describe('Versions', function () {
  it('qunit versions', function () {
    expect(failingVersions.qunit).to.be.deep
      .equal(failingVersionsRef.qunit);
  });

  it('qunitjs versions', function () {
    expect(failingVersions.qunitjs).to.be.deep
      .equal(failingVersionsRef.qunitjs);
  });

  it('jasmine versions', function () {
    expect(failingVersions.jasmine).to.be.deep
      .equal(failingVersionsRef.jasmine);
  });

  it('mocha versions', function () {
    expect(failingVersions.mocha).to.be.deep
      .equal(failingVersionsRef.mocha);
  });
});
