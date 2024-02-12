/* eslint-disable no-template-curly-in-string */

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  /**
   * @default
   * [
   *   '+([0-9])?(.{+([0-9]),x}).x',
   *   'master',
   *   'next',
   *   'next-major',
   *   {name: 'beta', prerelease: true},
   *   {name: 'alpha', prerelease: true},
   * ]
   */
  branches: [
    'main',
    'next',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    { name: 'rc', prerelease: 'rc' },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message: 'release(version): Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
