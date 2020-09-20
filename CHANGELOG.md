
1.2.3 / 2020-09-07
==================

### Changed

* Reporter: Align `actual` with `expected` in TAP reporter. (Robert Jackson) [#107](https://github.com/js-reporters/js-reporters/pull/107)

### Fixed

* Reporter: Correct spelling in `autoRegister()` error message. (P. Roebuck) [#108](https://github.com/js-reporters/js-reporters/issues/108)
* Reporter: Revert "Fix YAML output in TAP reporter". [#110](https://github.com/js-reporters/js-reporters/issues/110)

1.2.2 / 2019-05-13
==================

### Fixed

* Reporter: Fix YAML output in TAP reporter. (jeberger) [#110](https://github.com/js-reporters/js-reporters/issues/110)

1.2.1 / 2017-07-04
==================

### Changed

* Reporter: Print "actual:", "expected:" in the TAP reporeter even if undefined. (Martin Olsson)

### Fixed

* Reporter: Drop accidentally committed `console.warn()` statement. (Martin Olsson)

1.2.0 / 2017-03-22
==================

### Added

* Reporter: Improve TAP information and styling. (Florentin Simion)
* Reporter: Support todo test in TAP reporter. (Trent Willis)
* Docs: Add API section about the js-reporters package. (Florentin Simion)

### Changed

* Spec: Split "Suite" and "Test" objects into separate start and end objects. (Florentin Simion)
* Spec: Define "todo test". (Trent Willis)
* Test: Finish test coverage of `autoRegister` method. (Florentin Simion)
* Test: Update to integration with the latest Jasmine version. (Florentin Simion)
