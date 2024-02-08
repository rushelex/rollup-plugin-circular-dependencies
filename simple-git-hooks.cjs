module.exports = {
  'pre-commit': 'npx lint-staged -r',
  'commit-msg': 'npx commitlint -e',
};
