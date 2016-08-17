var TestEnd = require('../../dist/js-reporters.js').TestEnd

module.exports = {
  passingTest: new TestEnd('pass', undefined, [], 'passed', 0, []),
  failingTest: new TestEnd('fail', undefined, [], 'failed', 0, [
    new Error('first error'), new Error('second error')
  ]),
  skippedTest: new TestEnd('skip', undefined, [], 'skipped', 0, [])
}
