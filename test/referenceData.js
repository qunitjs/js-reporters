var JsReporters = require('../dist/js-reporters.js');
var Test = JsReporters.Test;
var Suite = JsReporters.Suite;


var foo = new Test("foo", "group a", "passed", 1, []);
var bar = new Test("bar goes wrong", "group a", "failed", 1, [{}]);
var baz = new Test("baz", "group b", "passed", 1, [], false);
var skipped = new Test("skipped test", "group b", "skipped", 1, []);
var subtest = new Test("subtest", "group with subgroup subgroup", "passed", 1, []);

var groupA = new Suite("group a", [], [foo, bar]);
var groupB = new Suite("group b", [], [baz, skipped]);
var subgroup = new Suite("subgroup", [], [subtest]);
var parent = new Suite("group with subgroup", [subgroup], []);

// Global Suite for QUnit
var globalSuiteNoNesting = new Suite("", [groupA, groupB], []);
// Global Suite for Jasmine
var globalSuiteNesting = new Suite("", [groupA, groupB, parent], []);

var runGroupA = [
    //["suiteStart", groupA],
    //["testStart", foo],
    ["testEnd", foo],
    //["testStart", bar],
    ["testEnd", bar],
    ["suiteEnd", groupA]
];

var runGroupB = [
    //["suiteStart", groupB],
    //["testStart", baz],
    ["testEnd", baz],
    //["testStart", skipped],
    ["testEnd", skipped],
    ["suiteEnd", groupB]
];

var runParent = [
    //["suiteStart", parent],
    //["suiteStart", subgroup],
    //["testStart", subtest],
    ["testEnd", subtest],
    ["suiteEnd", subgroup],
    ["suiteEnd", parent]
];

exports.Jasmine = [].concat(
    //[["runStart", globalSuiteNesting]],
    runGroupA,
    runGroupB,
    runParent,
    [["runEnd", globalSuiteNesting]]
);

exports.QUnit = [].concat(
    //[["runStart", globalSuiteNoNesting]],
    runGroupA,
    runGroupB,
    [["runEnd", globalSuiteNoNesting]]
);
