var mkdirp = require("mkdirp");
var rollup = require("rollup");
var fs = require("fs");
var babel = require("babel-core");
var pkg = require("./package.json");

mkdirp.sync("dist");

rollup.rollup({
    entry: "lib/index.js"
}).then(function (bundle) {
    var umd = bundle.generate({
        format: "umd",
        moduleName: "JsReporters"
    });

    var transformed = babel.transform(umd.code, pkg.babel);
    var license = fs.readFileSync("lib/license-header.js", {encoding: "utf8"})
        .replace("@VERSION", pkg.version)
        .replace("@DATE", ( new Date() ).toISOString().replace(/:\d+\.\d+Z$/, "Z"));
    var content = license + "(function() {\n" + transformed.code + "\n})();";
    fs.writeFileSync("dist/js-reporters.js", content);
}).catch(console.error);
