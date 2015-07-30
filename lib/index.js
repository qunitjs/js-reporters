import QUnitAdapter from "./adapters/QUnitAdapter.js";

import JasmineAdapter from "./adapters/JasmineAdapter.js";
import TapReporter from "./reporters/TapReporter.js";
import ConsoleReporter from "./reporters/ConsoleReporter.js";
import TestReporter, {testDataJasmine, testDataQUnit} from "./reporters/TestReporter.js";


export default {
    QUnitAdapter: QUnitAdapter,
    JasmineAdapter: JasmineAdapter,
    TapReporter: TapReporter,
    ConsoleReporter: ConsoleReporter,
    TestReporter: TestReporter,
    testData: {
        QUnit: testDataQUnit,
        Jasmine: testDataJasmine
    }
};
