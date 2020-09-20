/**
 * Known issues.
 */

module.exports = {
  qunitjs: [],
  qunit: [],
  jasmine: [
    '2.0.1',
    // jasmine@2.3.0: Jasmine kills the process without an error message.
    // Fixed in 2.3.1, <https://github.com/jasmine/jasmine-npm/blob/v2.99.0/release_notes/2.3.1.md>.
    '2.3.0',
    // Jasmine 2.5.0: Same bug as in the 2.3.0 version.
    // Fixed in 2.5.1, <https://github.com/jasmine/jasmine-npm/issues/88>.
    '2.5.0'
  ],
  mocha: [
    // mocha@2.1.0: mocha.run() throws "fn is not a function"
    // Fixed in 2.2.0, <https://github.com/mochajs/mocha/issues/1496>.
    '2.1.0',
    // mocha 2.5.0: Fails due to missing dependency.
    // Fixed in 2.5.1, <https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#251--2016-05-23>.
    '2.5.0'
  ]
};
