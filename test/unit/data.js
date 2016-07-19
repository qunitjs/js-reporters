var Test = require('../../dist/js-reporters.js').Test

module.exports = {
  passingTest: new Test('pass', undefined, [], 'passed', 0, []),
  failingTest: new Test('fail', undefined, [], 'failed', 0, [
    new Error('first error'), new Error('second error')
  ]),
  skippedTest: new Test('skip', undefined, [], 'skipped', 0, [])
}
