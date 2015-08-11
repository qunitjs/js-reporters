export class Test {
    constructor(testName, suiteName, status, runtime, errors) {
        this.testName = testName;
        this.suiteName = suiteName;
        this.status = status;
        this.runtime = runtime;
        this.errors = errors;
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

    getAllTests() {
        var childSuiteTests = this.childSuites
            .map((suite) => suite.getAllTests())
            .reduce((allTests, a) => allTests.concat(a), []);

        return this.tests.concat(childSuiteTests);
    }

    get runtime() {
        var runtime = this.getAllTests()
            .map((x) => x.runtime)
            .reduce((sum, x) => sum + x, 0);
        // If one of the tests has not been run yet, its runtime is undefined.
        // If we add undefined and a number we end up with NaN.
        if (isNaN(runtime)) {
            return undefined;
        } else {
            return runtime;
        }
    }

    get status() {
        var passed = 0, failed = 0, skipped = 0;

        for (let test of this.getAllTests()) {
            // If a suite contains a test whose status is still undefined,
            // there is no final status for the suite as well.
            if (test.status === undefined) {
                return undefined;
            } else if (test.status === "passed") {
                passed++;
            } else if (test.status === "skipped") {
                skipped++;
            } else {
                failed++;
            }
        }

        if (failed > 0) {
            return "failed";
        } else if (skipped > 0 && passed === 0) {
            return "skipped";
        } else {
            return "passed";
        }
    }
}

Object.defineProperties(Suite.prototype, {
    toJSON: {
        value: function () {
            let ret = {};
            for (let x in this) {
                ret[x] = this[x];
            }
            return ret;
        }
    },
    runtime: {
        enumerable: true
    },
    status: {
        enumerable: true
    }
});

