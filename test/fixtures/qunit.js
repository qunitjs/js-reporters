var QUnit = require('qunitjs')

QUnit.test('global test', function () {

})

QUnit.module('suite with passing test')
QUnit.test('should pass', function () {

})

QUnit.module('suite with skipped test')
QUnit.skip('should skip', function () {

})

QUnit.module('suite with failing test')
QUnit.test('should fail', function () {
  throw new Error('error')
})

QUnit.module('suite with tests')
QUnit.test('should pass', function () {

})
QUnit.skip('should skip', function () {

})
QUnit.test('should fail', function () {
  throw new Error('error')
})

QUnit.module('outter suite', function () {
  QUnit.module('inner suite', function () {
    QUnit.test('inner test', function () {

    })
  })

  QUnit.test('outter test', function () {

  })
})
