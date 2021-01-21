import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';


export default {
  input: {
    'demo.bundle': 'demo.js',
    'fixture.bundle': 'dist/test/fixtures.js',
    'helpers.bundle': 'dist/test/helpers.js',
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
      'process.env.NODE_ENV': '"production"', // or 'development'
      'vue-demi': 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.prod.js'
    }),
    nodeResolve()
  ],
};
