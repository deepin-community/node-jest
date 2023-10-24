const babel = require('@rollup/plugin-babel');
const ts = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const multiInput = require('rollup-plugin-multi-input').default;

module.exports = {
  input: ['../bcoe-v8-coverage/src/lib/*.ts'],
  output: {
    dir: '../bcoe-v8-coverage/dist/lib',
    format: 'cjs',
  },
  plugins: [
    multiInput(),
    babel({ babelHelpers: 'bundled' }),
    ts({
      //declaration: true,
      skipLibCheck: true,
      exclude:["node_modules","debian","test","gulpfile.ts"],
      allowSyntheticDefaultImports: true,
      downlevelIteration: true,
      //declarationDir:'../bcoe-v8-coverage/dist/lib',
      //dir:'../bcoe-v8-coverage/dist/lib',
    }),
    commonjs(),
  ]
};
