(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.unknown = mod.exports;
    }
})(this, function (exports) {
    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.JsReporters = factory();
    })(this, function () {
        'use strict';

        var EventEmitter = (function () {
            function EventEmitter() {
                _classCallCheck(this, EventEmitter);

                this.listeners = {};
            }

            _createClass(EventEmitter, [{
                key: 'on',
                value: function on(name, fun) {
                    if (this.listeners[name] == undefined) {
                        this.listeners[name] = [fun];
                    } else {
                        this.listeners[name].push(fun);
                    }
                }
            }, {
                key: 'emit',
                value: function emit(name) {
                    if (this.listeners[name]) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = this.listeners[name][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var fun = _step.value;

                                for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                                    params[_key - 1] = arguments[_key];
                                }

                                fun.apply(undefined, params); //callback
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }
            }]);

            return EventEmitter;
        })();

        var Test = function Test(testName, suiteName, status, runtime, errors, skipped) {
            _classCallCheck(this, Test);

            this.testName = testName;
            this.suiteName = suiteName;
            this.status = status;
            this.runtime = runtime;
            this.errors = errors;
            this.skipped = skipped;
        };

        var Suite = (function () {
            /**
             *
             * @param name
             * @param childSuites
             * @param tests: array containing tests belonging to the suite but not to a child suite
             */

            function Suite(name, childSuites, tests) {
                _classCallCheck(this, Suite);

                this.name = name;
                this.childSuites = childSuites;
                this.tests = tests;
            }

            _createClass(Suite, [{
                key: 'getAllTests',
                value: function getAllTests(arr) {
                    if (arr === undefined) {
                        arr = [];
                    }
                    this.tests.forEach(function (test) {
                        arr.push(test);
                    });
                    this.childSuites.forEach(function (child) {
                        child.getAllTests(arr);
                    });
                    return arr;
                }
            }, {
                key: 'getTotal',
                value: function getTotal() {
                    var summary = {
                        passed: 0,
                        failed: 0,
                        runtime: 0
                    };

                    var allTests = this.getAllTests();
                    allTests.forEach(function (test) {
                        if (test.status != 'passed') {
                            summary.failed++;
                        } else {
                            summary.passed++;
                        }
                        summary.runtime += test.runtime;
                    });

                    return summary;
                }
            }]);

            return Suite;
        })();

        //TODO: good idea?
        //Mocha just passes the exception thrown by the assertion library
        /*
        export class Error {
            constructor(name, message, stack, expected, actual){
                this.name = name;
                this.message = message;
                this.stack = stack;
                this.expected = expected;
                this.actual = actual;
            }
        }
        /**/

        var foo = new Test('foo', 'passed', 42);
        var bar = new Test('bar goes wrong', 'failed', 42);
        var baz = new Test('baz', 'passed', 42);

        var groupA = new Suite('group a', [], [foo, bar]);
        var groupB = new Suite('group b', [], [baz]);
        var root = new Suite('root', [groupA, groupB], []);

        var demoData = root;

        var QUnitAdapter = (function (_EventEmitter) {
            function QUnitAdapter() {
                _classCallCheck(this, QUnitAdapter);

                _get(Object.getPrototypeOf(QUnitAdapter.prototype), 'constructor', this).call(this);
                QUnit.done(this.onDone.bind(this));
                QUnit.testDone(this.onTestDone.bind(this));
                QUnit.moduleDone(this.onModuleDone.bind(this));
                QUnit.log(this.onLog.bind(this));
                QUnit.testStart(this.onTestStart.bind(this));

                this.tests = {};
                this.suites = [];
            }

            _inherits(QUnitAdapter, _EventEmitter);

            _createClass(QUnitAdapter, [{
                key: 'onTestStart',
                value: function onTestStart() {
                    this.errors = [];
                }
            }, {
                key: 'onLog',
                value: function onLog(details) {
                    if (details.result != true) {
                        this.errors.push(details);
                    }
                }
            }, {
                key: 'onTestDone',
                value: function onTestDone(details) {
                    var status;
                    if (details.failed != 0) {
                        status = 'failed';
                    } else {
                        status = 'passed';
                    }

                    var test = new Test(details.name, details.module, status, details.runtime, this.errors, details.skipped);
                    this.tests[details.testId] = test;
                    this.emit('testEnd', test);
                }
            }, {
                key: 'onDone',
                value: function onDone(details) {
                    var globalSuite = new Suite('', this.suites, []);
                    this.emit('runEnd', globalSuite);
                }
            }, {
                key: 'onModuleDone',
                value: function onModuleDone(details) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = details.tests[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var test = _step2.value;

                            // check if the module is actually finished:
                            // QUnit may trigger moduleDone multiple times if it reorders tests
                            // if not, return and wait for the next moduleDone
                            if (!(test.testId in this.tests)) {
                                return;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                _iterator2['return']();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    var testArray = [];
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = details.tests[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            test = _step3.value;

                            testArray.push(this.tests[test.testId]);
                            delete this.tests[test.testId];
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                _iterator3['return']();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    var suite = new Suite(details.name, [], testArray);
                    this.suites.push(suite);
                    this.emit('suiteEnd', suite);
                }
            }]);

            return QUnitAdapter;
        })(EventEmitter);

        var TapReporter = (function () {
            function TapReporter(adapter) {
                _classCallCheck(this, TapReporter);

                this.adapter = adapter;
                this.count = 0;

                adapter.on('testEnd', this.onTestEnd.bind(this));
                adapter.on('runEnd', this.onRunEnd.bind(this));
            }

            _createClass(TapReporter, [{
                key: 'onTestEnd',
                value: function onTestEnd(test) {
                    this.count++;
                    if (test.status == 'failed') {
                        console.log('not ok ' + this.count + ' ' + test.testName);
                    } else {
                        console.log('ok ' + this.count + ' ' + test.testName);
                    }
                }
            }, {
                key: 'onRunEnd',
                value: function onRunEnd(suite) {
                    console.log('1..' + this.count);
                }
            }]);

            return TapReporter;
        })();

        var index = {
            QUnitAdapter: QUnitAdapter,
            demoData: demoData,
            TapReporter: TapReporter
        };

        return index;
    });
});
