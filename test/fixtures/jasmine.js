/* global describe, it, xit */

it('global test', function () {

})

describe('suite with passing test', function () {
  it('should pass', function () {

  })
})

describe('suite with skipped test', function () {
  xit('should skip', function () {

  })
})

describe('suite with failing test', function () {
  it('should fail', function () {
    throw new Error('error')
  })
})

describe('suite with tests', function () {
  it('should pass', function () {

  })

  xit('should skip', function () {

  })

  it('should fail', function () {
    throw new Error('error')
  })
})

describe('outter suite', function () {
  it('outter test', function () {

  })

  describe('inner suite', function () {
    it('inner test', function () {

    })
  })
})
