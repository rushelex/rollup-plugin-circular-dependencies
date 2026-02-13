/* eslint-disable no-template-curly-in-string */

/** @type {import('release-it').Config} */
module.exports = {
  git: {
    tagName: 'v${version}',
    commitMessage: 'chore(release): v${version} [skip ci]',
    push: true,
    requireUpstream: false,
    requireCleanWorkingDir: true,
  },
  github: {
    release: true,
    releaseName: 'v${version}',
  },
  npm: {
    publish: true,
    skipChecks: true,
    publishPackageManager: 'pnpm',
    publishArgs: ['--provenance', '--access', 'public', '--no-git-checks'],
  },
  hooks: {
    'after:bump': 'cd ../.. && pnpm install --lockfile-only && git add pnpm-lock.yaml',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      infile: 'CHANGELOG.md',
      strictSemVer: false,
      preset: {
        name: 'conventionalcommits',
        bumpStrict: true,
        types: [
          { type: 'feat', section: '🚀 Enhancements' },
          { type: 'fix', section: '🩹 Fixes' },
          { type: 'perf', section: '🔥 Performance' },
          { type: 'refactor', section: '💅 Refactors', hidden: true },
          { type: 'build', section: '📦 Build', hidden: true },
          { type: 'types', section: '🌊 Types' },
          { type: 'docs', section: '📖 Documentation' },
          { type: 'chore', section: '🏡 Chore', hidden: true },
          { type: 'test', section: '✅ Tests', hidden: true },
          { type: 'style', section: '🎨 Styles' },
          { type: 'ci', section: '🤖 CI', hidden: true },
        ],
      },
    },
  },
};
