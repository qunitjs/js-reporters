module.exports = function (config) {
  const { babel } = require('@rollup/plugin-babel');
  const commonjs = require('@rollup/plugin-commonjs');
  const { nodeResolve } = require('@rollup/plugin-node-resolve');

  config.set({
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'test/unit/tap-reporter.js',
      'test/unit/helpers.js'
    ],
    preprocessors: {
      'test/unit/**.js': ['rollup']
    },
    rollupPreprocessor: {
      external: ['sinon'],
      output: {
        globals: {
          sinon: 'sinon'
        },
        format: 'iife',
        name: 'JsReporters_Test',
        sourcemap: true
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
    },
    frameworks: ['qunit'],
    customLaunchers: {
      firefox45: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '45.0'
      },
      ie9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '9'
      },
      ie10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10'
      },
      ie11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11'
      },
      edge15: {
        // Edge 40 (EdgeHTML 15)
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        version: '15.15063'
      },
      edge: {
        // Edge 80+ (Chromium)
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge'
      },
      chrome58: {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '58.0'
      }
    },
    concurrency: 4,
    browsers: [
      'firefox45',
      // FIXME: IE 9-10 broken due to rollup indirection logic behind require()
      // relying on "__proto__" not counting in `Object.keys`.
      // Ref https://github.com/rollup/plugins/issues/773.
      // 'ie9',
      // 'ie10',
      // FIXME: IE 11 broken due to 'kleur' using String#includes and Array#includes
      // Ref https://github.com/lukeed/kleur/pull/45.
      // 'ie11',
      'edge15',
      'edge',
      'chrome58'
    ],
    logLevel: 'WARN',
    singleRun: true,
    autoWatch: false
  });
};
