/**
 * Here is a brief list with the known issues.
 *
 * Jasmine 2.3.0: the Jasmine adapter is working, something happens during
 * testing with our testing framework Mocha, which is receiving SIGINT and aborts its runner,
 * it may be a problem with the testing not with the adapter itself.
 *
 * Mocha 2.5.0: is not working because of a missing dependency, this is Mocha's
 * fault @see
 * https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#251--2016-05-23.
 */

module.exports = {
  'qunitjs': ['1.9.0', '1.10.0', '1.11.0', '1.12.0-pre', '1.12.0', '1.13.0',
    '1.14.0', '1.15.0', '1.16.0', '1.17.0', '1.17.1', '1.18.0', '1.19.0'],
  'jasmine': ['2.3.0'],
  'mocha': ['0.3.0', '0.3.1', '0.3.2', '0.3.3', '0.3.4', '0.3.6', '0.4.0',
    '0.5.0', '0.6.0', '0.7.0', '0.7.1', '0.8.0', '0.9.0', '0.10.0', '0.10.1',
    '0.10.2', '0.11.0', '0.12.0', '0.12.1', '0.13.0', '0.14.0', '0.14.1',
    '1.0.0', '1.0.1', '1.0.2', '1.0.3', '1.1.0', '1.2.0', '1.2.1', '1.2.2',
    '1.3.0', '1.3.1', '1.3.2', '1.4.0', '1.4.1', '1.4.2', '1.4.3', '1.5.0',
    '1.6.0', '1.7.0', '1.7.1', '1.7.2', '1.7.3', '1.7.4', '1.8.0', '1.8.1',
    '1.8.2', '1.9.0', '1.10.0', '1.11.0', '1.12.0', '1.12.1', '1.13.0',
    '1.14.0', '1.15.0', '1.15.1', '1.16.0', '1.16.1', '1.16.2', '1.17.0',
    '1.17.1', '2.1.0', '2.5.0']
}
