var hasGrouping = "group" in console && "groupEnd" in console;

export default class ConsoleReporter {
    constructor(runner) {
        runner.on("suiteStart", this.onSuiteStart.bind(this));
        runner.on("testEnd", this.onTestEnd.bind(this));
        runner.on("suiteEnd", this.onSuiteEnd.bind(this));
        runner.on("runEnd", this.onRunEnd.bind(this));
    }

    static init(runner) {
        return new ConsoleReporter(runner);
    }

    onSuiteStart(suite) {
        if (hasGrouping) {
            console.group(suite.name);
        }
    }

    onTestEnd(test) {
        console.log("testEnd", test);
    }

    onSuiteEnd(suite) {
        console.log("suiteEnd", suite);
        if (hasGrouping) {
            console.groupEnd();
        }
    }

    onRunEnd(globalSuite) {
        console.log("runEnd", globalSuite, globalSuite.getTotal());
    }
}

