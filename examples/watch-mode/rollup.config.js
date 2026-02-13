import circularDependencies from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    circularDependencies({
      throwOnError: false,
    }),
  ],
};
