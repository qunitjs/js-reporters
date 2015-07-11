export class Test {
    constructor(name, status, runtime) {
        this.name = name;
        this.status = status;
        this.runtime = runtime;
    }
}

export class Suite {
    /**
     *
     * @param name
     * @param childSuites
     * @param tests: array containing tests belonging to the suite but not to a child suite
     */
    constructor(name, childSuites, tests) {
        this.name = name;
        this.childSuites = childSuites;
        this.tests = tests;
    }

    getAllTests(arr) {
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

    getTotal() {
        var summary = {
            passed: 0,
            failed: 0,
            runtime: 0
        };

        var allTests = this.getAllTests();
        allTests.forEach(function (test) {
            if (test.status != "passed") {
                summary.failed++;
            }
            else {
                summary.passed++;
            }
            summary.runtime += test.runtime;

        });

        return summary;
    }
}


var foo = new Test("foo", "passed", 42);
var bar = new Test("bar goes wrong", "failed", 42);
var baz = new Test("baz", "passed", 42);

var groupA = new Suite("group a", [], [foo, bar]);
var groupB = new Suite("group b", [], [baz]);
var root = new Suite("root", [groupA, groupB], []);

export var demoData = root;