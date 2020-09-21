const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const isCoverage = process.env.BUILD_TARGET === 'dev';
const version = require('./package.json').version;

module.exports = {
  input: 'index.js',
  output: {
    file: 'dist/js-reporters.js',
    sourcemap: isCoverage,
    format: 'umd',
    name: 'JsReporters',
    exports: 'auto',
    banner: `/*! JsReporters ${version} | Copyright JS Reporters https://github.com/js-reporters/ | https://opensource.org/licenses/MIT */`
  },
  plugins: [
    // For 'events' and 'kleur'
    nodeResolve({
      preferBuiltins: false
    }),
    commonjs({
      // This makes require() work like in Node.js,
      // instead of wrapped in a {default:…} object.
      requireReturnsDefault: 'auto'
    }),
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      presets: [
        ['@babel/preset-env', {
          targets: {
            ie: 9
          }
        }]
      ]
    })
  ]
};
