module.exports = {
  'src/**/*.{js,ts,jsx,tsx,json,md}': (filenames) => {
    return `prettier --write ${filenames.join(' ')}`;
  },
  'src/**/*.{js,jsx,ts,tsx}': (filenames) => {
    return `cross-env NODE_ENV=production eslint --fix --color --report-unused-disable-directives --max-warnings 0 ${filenames.join(
      ' ',
    )}`;
  },
  'src/**/*.{ts,tsx}': () => {
    return 'npm run typecheck';
  },
};
