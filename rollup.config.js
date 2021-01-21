import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: {
    'demo.bundle': 'dist/index.js',
    'fixture.bundle': 'dist/test/fixtures.js',
  },
  output: {
    dir: 'dist',
    format: 'es',
    exports: 'named'
  },
  plugins: [nodeResolve()],
  external: ['vue']
};