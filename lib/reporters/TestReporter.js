import {Test, Suite} from "../Data.js";

var foo = new Test("foo", "group a", "passed", 1, [], false);
var bar = new Test("bar goes wrong", "group a", "failed", 1, [{}], false);
var baz = new Test("baz", "group b", "passed", 1, [], false);
var skipped = new Test("skipped test", "group b", "skipped", 1, [], true);
var subtest = new Test("subtest", "subgroup", "passed", 1, [], false);

var groupA = new Suite("group a", [], [foo, bar]);
var groupB = new Suite("group b", [], [baz, skipped]);
var subgroup = new Suite("subgroup", [], [subtest]);
var parent = new Suite("group with subgroup", [subgroup], []);

// Globale Suite for QUnit
var globalSuiteNoNesting = new Suite("", [groupA, groupB], []);
// Globale Suite for Jasmine
var globalSuiteNesting = new Suite("", [groupA, groupB, parent]);


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

export var jasmine = [].concat(
    //[["runStart", globalSuiteNesting]],
    runGroupA,
    runGroupB,
    runParent,
    [["runEnd", globalSuiteNesting]]
);

export var qunit = [].concat(
    //[["runStart", globalSuiteNoNesting]],
    runGroupA,
    runGroupB,
    [["runEnd", globalSuiteNoNesting]]
);

export default class TestReporter {
    constructor(runner, referenceData) {
        this.referenceData = referenceData.slice();
        runner.on("runStart", this.onEvent.bind(this, "runStart"));
        runner.on("suiteStart", this.onEvent.bind(this, "suiteStart"));
        runner.on("testStart", this.onEvent.bind(this, "testStart"));
        runner.on("testEnd", this.onEvent.bind(this, "testEnd"));
        runner.on("suiteEnd", this.onEvent.bind(this, "suiteEnd"));
        runner.on("runEnd", this.onEvent.bind(this, "runEnd"));
    }

    static init(runner, data) {
        return new TestReporter(runner, data);
    }

    _equals(expected, actual) {
        if (expected instanceof Suite) {
            if (expected.name !== actual.name) {
                return false;
            }
            if (!this._equals(expected.childSuites, actual.childSuites)){
                return false;
            }

            if (!this._equals(expected.tests, actual.tests)) {
                return false;
            }

        } else if (expected instanceof Test) {
            for (let x of ["testName", "suiteName", "status", "skipped"]) {
                if (expected[x] !== actual[x]) {
                    return false;
                }
            }
            if (typeof actual.runtime !== "number") {
                return false;
            }

            if (expected.errors.length !== actual.errors.length) {
                return false;
            }


        } else if (Array.isArray(expected)){
            if (expected.length !== actual.length){
                return false;
            }

            for (var i = 0; i < expected.length; i++) {
                if (!this._equals(expected[i], actual[i])) {
                    return false;
                }
            }

        } else {
            throw "unknown object";
        }
        return true;
    }

    onEvent(event, data) {
        var expectedEvent = this.referenceData.shift();

        if (expectedEvent[0] === event) {
            if (this._equals(data, expectedEvent[1])) {
                console.log("ok", event, data);
            } else {
                console.log("not ok", data, expectedEvent[1]);
            }
        } else {
            console.log("not ok! " + expectedEvent[0] + " was expected but " + event + " was thrown");
        }
    }
}




