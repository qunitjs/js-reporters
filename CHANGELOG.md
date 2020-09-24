Changelog for the [js-reporters](https://www.npmjs.com/package/js-reporters) package. See [spec/](../spec) for the CRI standard.

1.2.3 / 2020-09-07
==================

### Changed

* TapReporter: Align `actual` with `expected` in TAP output. (Robert Jackson) [#107](https://github.com/js-reporters/js-reporters/pull/107)

### Fixed

* Helpers: Correct spelling in `autoRegister()` error message. (P. Roebuck) [#108](https://github.com/js-reporters/js-reporters/issues/108)
* TapReporter: Revert "Fix YAML syntax". [#110](https://github.com/js-reporters/js-reporters/issues/110)

1.2.2 / 2019-05-13
==================

### Fixed

* TapReporter: Fix YAML syntax. (jeberger) [#110](https://github.com/js-reporters/js-reporters/issues/110)

1.2.1 / 2017-07-04
==================

### Changed

* TapReporter: Print "actual:", "expected:" even if undefined. (Martin Olsson)

### Fixed

* TapReporter: Drop accidentally committed `console.warn()` statement. (Martin Olsson)

1.2.0 / 2017-03-22
==================

### Added

* TapReporter: Improve TAP information and styling. (Florentin Simion)
* TapReporter: Support todo test in TAP reporter. (Trent Willis)
* Docs: Add API docs for the js-reporters package. (Florentin Simion)
