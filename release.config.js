/* eslint-disable no-template-curly-in-string */

/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: [
    'main',
    { name: 'rc', prerelease: 'rc', channel: 'rc' },
  ],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', {
      changelogFile: 'packages/plugin/CHANGELOG.md',
    }],
    ['@semantic-release/npm', {
      pkgRoot: 'packages/plugin',
    }],
    '@semantic-release/github',
    ['@semantic-release/git', {
      assets: [
        'packages/plugin/CHANGELOG.md',
        'packages/plugin/package.json',
        'pnpm-lock.yaml',
      ],
      message: 'chore(release): v${nextRelease.version} [skip ci]',
    }],
  ],
};
