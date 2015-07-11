import EventEmitter from "../EventEmitter.js"
import {Test, Suite} from "../Data.js"


export default class QUnitAdapter extends EventEmitter {
    constructor() {
        super();
        QUnit.done(this.onDone.bind(this));
        QUnit.testDone(this.onTestDone.bind(this));
        QUnit.moduleDone(this.onModuleDone.bind(this));

        this.tests = {};
        this.suites = [];

    }

    onTestDone(details) {
        var status;
        if (details.failed != 0) {
            status = "failed";
        }
        else {
            status = "passed";
        }
        var test = new Test(details.name, status, details.runtime);
        this.tests[details.testId] = test;
        this.emit("testEnd", test);

    }

    onDone(details) {
        var globalSuite = new Suite("", this.suites, []);
        this.emit("runEnd", globalSuite);
    }

    onModuleDone(details) {
        for (var test of details.tests){
            // check if the module is actually finished:
            // QUnit may trigger moduleDone multiple times if it reorders tests
            // if not, return and wait for the next moduleDone
            if(!(test.testId in this.tests)){
                return;
            }
        }
        var testArray = [];
        for (test of details.tests){
            testArray.push(this.tests[test.testId]);
            delete this.tests[test.testId];
        }

        var suite = new Suite(details.name, [], testArray);
        this.suites.push(suite);
        this.emit("suiteEnd", suite);
    }
}