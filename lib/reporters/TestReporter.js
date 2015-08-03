import {Test, Suite} from "../Data.js";

var foo = new Test("foo", "group a", "passed", 1, [], false);
var bar = new Test("bar goes wrong", "group a", "failed", 1, [{}], false);
var baz = new Test("baz", "group b", "passed", 1, [], false);
var skipped = new Test("skipped test", "group b", "skipped", 1, [], true);
var subtest = new Test("subtest", "group with subgroup subgroup", "passed", 1, [], false);

var groupA = new Suite("group a", [], [foo, bar]);
var groupB = new Suite("group b", [], [baz, skipped]);
var subgroup = new Suite("subgroup", [], [subtest]);
var parent = new Suite("group with subgroup", [subgroup], []);

// Globale Suite for QUnit
var globalSuiteNoNesting = new Suite("", [groupA, groupB], []);
// Globale Suite for Jasmine
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

export var testDataJasmine = [].concat(
    //[["runStart", globalSuiteNesting]],
    runGroupA,
    runGroupB,
    runParent,
    [["runEnd", globalSuiteNesting]]
);

export var testDataQUnit = [].concat(
    //[["runStart", globalSuiteNoNesting]],
    runGroupA,
    runGroupB,
    [["runEnd", globalSuiteNoNesting]]
);

/*
 The TestReporter verifies that a test runner outputs the right data in the right order.
 To do so, it compares the actual output with the provided reference data.
 The result is given in the ok attribute.
 */
export default class TestReporter {
    /**
     * @param runner: standardized test runner (or adapter)
     * @param referenceData: An array of all expected (eventName, eventData) tuples in the right order
     */
    constructor(runner, referenceData) {
        this.referenceData = referenceData.slice();
        this.ok = undefined;
        runner.on("runStart", this.onEvent.bind(this, "runStart"));
        runner.on("suiteStart", this.onEvent.bind(this, "suiteStart"));
        runner.on("testStart", this.onEvent.bind(this, "testStart"));
        runner.on("testEnd", this.onEvent.bind(this, "testEnd"));
        runner.on("suiteEnd", this.onEvent.bind(this, "suiteEnd"));
        runner.on("runEnd", this.onEvent.bind(this, "runEnd"));
    }

    /**
     * Gets called on each event emitted by the runner. Checks if the actual event matches the expected event.
     */
    onEvent(eventName, eventData) {
        var [expectedEventName, expectedEventData] = this.referenceData.shift();

        if (expectedEventName === eventName && this.equals(expectedEventData, eventData)) {
            //event is as expected
            if (this.ok === undefined && this.referenceData.length === 0) {
                this.ok = true;
            }
        } else {
            this.ok = false;
            console.error("expected:", expectedEventName, expectedEventData, "actual:", eventName, eventData);
        }
    }

    /**
     * Helper function to compare
     *  - two Test objects
     *  - two Suite objects
     *  - two arrays of Test or Suite objects
     *  The equality check is not completely strict, e.g. the runtime of a Test does not have to be equal.
     * @returns {boolean}: true if both objects are equal, false otherwise
     */
    equals(expected, actual) {
        if (expected instanceof Suite) {
            if (expected.name !== actual.name) {
                return false;
            }
            if (!this.equals(expected.childSuites, actual.childSuites)) {
                return false;
            }

            if (!this.equals(expected.tests, actual.tests)) {
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


        } else if (Array.isArray(expected)) {
            if (expected.length !== actual.length) {
                return false;
            }

            for (var i = 0; i < expected.length; i++) {
                if (!this.equals(expected[i], actual[i])) {
                    return false;
                }
            }

        } else {
            return false;
        }
        return true;
    }
}
