var fs = require('fs');
var babel = require('rollup-plugin-babel');
var pkg = require('./package.json');

var licenseHeader = fs.readFileSync('license-header', {encoding: 'utf8'})
      .replace('@VERSION', pkg.version)
      .replace('@DATE', (new Date()).toDateString());

module.exports = {
  entry: 'lib/index.js',
  dest: 'dist/js-reporters.js',
  format: 'umd',
  moduleName: 'JsReporters',
  banner: licenseHeader,
  plugins: [
    babel()
  ]
};
