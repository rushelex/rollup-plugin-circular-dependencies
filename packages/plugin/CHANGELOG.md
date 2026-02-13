# [2.0.0](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.2.0...v2.0.0) (2026-02-13)


* feat!: drop Rollup v2 support and remove compatibility layer ([63c18e3](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/63c18e3e2a7980263707b454f2062ba3347add5a))


### Features

* support watch mode ([5135d53](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/5135d53dd3f6a22ed2706a752b7709e2a97ca660))


### BREAKING CHANGES

* Rollup v2 is no longer supported. Minimum required version is now Rollup v3.

# [1.2.0](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.1.2...v1.2.0) (2026-02-13)


### Bug Fixes

* add Rollup v2 compatibility for pluginContext.info() ([cc95c8d](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc95c8def6c6601b656d98cb62e1a56cc988d87a))
* **formatters:** support uppercase boolean values of color envs ([28d4c4f](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/28d4c4facf72038f2662f04c2869867c494e2d8c))
* **moduleTree:** use localeCompare for cycle node sorting ([e752fb0](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/e752fb0a60756edfc1e9bac0435e1cb4c0b2d838))
* **plugin:** handle undefined savedOnLog with explicit fallback ([f071442](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/f071442e3a5cf56bdf5d7def2a4ebabf4b8a8748))
* **release:** add --no-git-checks flag to npm publish args ([d3f1ece](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/d3f1ecee2361276488f2f604718429403e3b752a))


### Features

* remove ESM dependencies, support CJS and ESM native, bump Node.js support to >=20.12.0 ([1a8c4e0](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/1a8c4e0fadbeb33d63ee28001790892e1601c929))

# Changelog

## [1.2.0-rc.9](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.2.0-rc.8...v1.2.0-rc.9) (2026-02-13)

### 🩹 Fixes

* **release:** add --no-git-checks flag to npm publish args ([d3f1ece](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/d3f1ecee2361276488f2f604718429403e3b752a))

## [1.2.0-rc.8](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.2.0-rc.7...v1.2.0-rc.8) (2026-02-13)

### 📖 Documentation

* update plugin options documentation with lifecycle hooks ([7add308](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/7add308e44352e6bf730885c10929beff8c47028))

## [1.2.0-rc.7](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.2.0-rc.6...v1.2.0-rc.7) (2026-02-13)

### 🩹 Fixes

* **formatters:** support uppercase boolean values of color envs ([28d4c4f](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/28d4c4facf72038f2662f04c2869867c494e2d8c))
* **moduleTree:** use localeCompare for cycle node sorting ([e752fb0](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/e752fb0a60756edfc1e9bac0435e1cb4c0b2d838))
* **plugin:** handle undefined savedOnLog with explicit fallback ([f071442](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/f071442e3a5cf56bdf5d7def2a4ebabf4b8a8748))

### 💅 Refactors

* **context:** make moduleNodes readonly in Context class ([3235998](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/3235998a534e53f995c06601461e2a829144687a))
* **context:** use Map.clear() instead of new Map() ([758446d](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/758446d36e6ac06125db18198bdbf847000f2f8a))
* **formatOptions:** extract formatter selection from closure ([95add51](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/95add515d48f4dff983e1298e54f88cfccd6f267))
* **moduleTree:** simplify resolveChildren with map/filter ([cda6e0d](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cda6e0dc15e41394a38b6875ac10e25b53f45f6c))
* **print:** optimize validateCycleData parameter order and cycle counting ([4aeee50](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/4aeee501831387c703e7af7edba3602727bb2865))

### 🏡 Chore

* **ci:** disable strictSemVer in release-it config ([444acb6](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/444acb602770644a0378edfc2d896a4c30f74c7d))

## v1.2.0-rc.6

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.1.2...v1.2.0-rc.6)

### 🚀 Enhancements

- Remove ESM dependencies, support CJS and ESM native, bump Node.js support to >=20.12.0 ([1a8c4e0](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/1a8c4e0))

### 🩹 Fixes

- Add Rollup v2 compatibility for pluginContext.info() ([cc95c8d](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc95c8d))

### 🏡 Chore

- Replace semantic-release with changelogen, then migrate to release-it ([2a8effc](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/2a8effc))
- Move @rollup/pluginutils from devDependencies to dependencies ([d2cb02b](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/d2cb02b))

### 🤖 CI

- Streamline workflow by removing install job and adding build steps ([4ec892c](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/4ec892c))
- Add Rollup v2/v3 compatibility testing workflow ([ff3528a](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/ff3528a))
- Add Rollup v4 to compatibility testing matrix ([b12f382](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/b12f382))

### ❤️ Contributors

- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))

## v1.1.2

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.1.1...v1.1.2)

### 🩹 Fixes

- Work with empty data ([694f764](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/694f764))

### ❤️ Contributors

- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))


## v1.1.1

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Changes plugin name ([fb253e4](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/fb253e4))

### ❤️ Contributors

- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))


## v1.1.0

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.0.2...v1.1.0)

### 🚀 Enhancements

- Initial commit ([3fac37f](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/3fac37f))
- Initial commit ([9707ddc](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/9707ddc))
- Create minor release ([393252d](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/393252d))

### 🩹 Fixes

- Tests ([#6](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/6))
- **docs:** Update docs and create new release ([#9](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/9))
- **docs:** Update docs and create new release ([#10](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/10))
- Updates release config ([b019377](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/b019377))

### 🏡 Chore

- Adds renovate ([6435fce](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/6435fce))
- Adds GH workflows ([36f3753](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/36f3753))
- Adds semantic release ([cc4cb77](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc4cb77))
- **release:** 1.0.0 [skip ci] ([05233cf](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/05233cf))
- Fix semantic release config ([cc398b5](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc398b5))
- **release:** 1.0.1 [skip ci] ([bbba3cf](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/bbba3cf))
- Updates .gitignore ([#8](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/8))
- **release:** 1.0.2 [skip ci] ([918f84b](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/918f84b))
- **release:** Changes commit message ([b6bef5b](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/b6bef5b))

### ❤️ Contributors

- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))
- Semantic-release-bot <semantic-release-bot@martynus.net>


## v1.0.2

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.0.1...v1.0.2)

### 🩹 Fixes

- **docs:** Update docs and create new release ([#9](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/9))
- **docs:** Update docs and create new release ([#10](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/10))
- Updates release config ([b019377](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/b019377))

### 🏡 Chore

- Updates .gitignore ([#8](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/8))
- **release:** 1.0.2 [skip ci] ([918f84b](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/918f84b))

### ❤️ Contributors

- Semantic-release-bot <semantic-release-bot@martynus.net>
- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))


## v1.0.1

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/v1.0.0...v1.0.1)

### 🚀 Enhancements

- Initial commit ([3fac37f](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/3fac37f))
- Initial commit ([9707ddc](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/9707ddc))

### 🩹 Fixes

- Tests ([#6](https://github.com/rushelex/rollup-plugin-circular-dependencies/pull/6))

### 🏡 Chore

- Adds renovate ([6435fce](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/6435fce))
- Adds GH workflows ([36f3753](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/36f3753))
- Adds semantic release ([cc4cb77](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc4cb77))
- **release:** 1.0.0 [skip ci] ([05233cf](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/05233cf))
- Fix semantic release config ([cc398b5](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/cc398b5))
- **release:** 1.0.1 [skip ci] ([bbba3cf](https://github.com/rushelex/rollup-plugin-circular-dependencies/commit/bbba3cf))

### ❤️ Contributors

- Aleksey Shelementev ([@rushelex](https://github.com/rushelex))
- Semantic-release-bot <semantic-release-bot@martynus.net>


## v1.0.0

[compare changes](https://github.com/rushelex/rollup-plugin-circular-dependencies/compare/9707ddc6007a181c8b34669b265be356edd96e00...v1.0.0)
