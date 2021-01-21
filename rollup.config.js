import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';


export default {
  input: {
    'demo.bundle': 'dist/index.js',
    'fixture.bundle': 'dist/test/fixtures.js',
  },
  output: {
    dir: 'docs/js',
    format: 'es',
    exports: 'named',
    name: 'demo',
    chunkFileNames: '[name].bundle.js',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production') // or 'development'
    }),
    nodeResolve()
  ],
};
