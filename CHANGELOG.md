# eslint-plugin-yml

## 3.2.0

### Minor Changes

- [#573](https://github.com/ota-meshi/eslint-plugin-yml/pull/573) [`099cb89`](https://github.com/ota-meshi/eslint-plugin-yml/commit/099cb89a50e0e3a23632671a382dd2c1a194e373) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use `@ota-meshi/ast-token-store`

## 3.1.2

### Patch Changes

- [#569](https://github.com/ota-meshi/eslint-plugin-yml/pull/569) [`21904d6`](https://github.com/ota-meshi/eslint-plugin-yml/commit/21904d649574bcf5e2c64c3e341fa09ddab5ddce) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: type bug with eslint v10

## 3.1.1

### Patch Changes

- [#567](https://github.com/ota-meshi/eslint-plugin-yml/pull/567) [`5235c42`](https://github.com/ota-meshi/eslint-plugin-yml/commit/5235c4223d388d2c2ee2191c2ec16e781140bb2c) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: some bug with eslint v10

## 3.1.0

### Minor Changes

- [#564](https://github.com/ota-meshi/eslint-plugin-yml/pull/564) [`c8ff016`](https://github.com/ota-meshi/eslint-plugin-yml/commit/c8ff016b762ccfb43406ee45eefe2a338d3bcb16) Thanks [@antfu](https://github.com/antfu)! - Add ESLint v10 compatibility while maintaining v9 support
  - Migrated from deprecated `isSpaceBetweenTokens()` to `isSpaceBetween()` API
  - All changes are backward compatible with ESLint v9

## 3.0.0

### Major Changes

- [#543](https://github.com/ota-meshi/eslint-plugin-yml/pull/543) [`12df7f4`](https://github.com/ota-meshi/eslint-plugin-yml/commit/12df7f430855645aab9643e4ec1a443839bfa215) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Use language config in shareable configs. The shareable configs now use the new ESLint v9 language config API (`language: "yml/yaml"`) instead of the legacy parser approach (`languageOptions: { parser }`). This is a breaking change that aligns with ESLint's language plugin architecture.

## 2.0.2

### Patch Changes

- [#539](https://github.com/ota-meshi/eslint-plugin-yml/pull/539) [`0fc8d41`](https://github.com/ota-meshi/eslint-plugin-yml/commit/0fc8d41fa3fd17afdc8f399d61977334ba13fcc3) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: add fake scopeManager for SourceCode API compatibility

## 2.0.1

### Patch Changes

- [#536](https://github.com/ota-meshi/eslint-plugin-yml/pull/536) [`c7a45cd`](https://github.com/ota-meshi/eslint-plugin-yml/commit/c7a45cd09e9f7f4b87ea623913e6467490576710) Thanks [@luxass](https://github.com/luxass)! - fix: handle diff-sequences import issue

## 2.0.0

### Major Changes

- [#532](https://github.com/ota-meshi/eslint-plugin-yml/pull/532) [`40eb4be`](https://github.com/ota-meshi/eslint-plugin-yml/commit/40eb4bee573a66f13cf12dd0162b78bfc5ab73a1) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - feat: add ESLint language plugin support

- [#528](https://github.com/ota-meshi/eslint-plugin-yml/pull/528) [`c4e74d0`](https://github.com/ota-meshi/eslint-plugin-yml/commit/c4e74d0f5bb39c85028c90c5d5f8557b1c6c8829) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Convert package to ESM-only. The package now uses `"type": "module"` and only exports ESM modules. CommonJS `require()` is no longer supported. Users must use ES modules (`import`) to load this plugin.

- [#527](https://github.com/ota-meshi/eslint-plugin-yml/pull/527) [`4059169`](https://github.com/ota-meshi/eslint-plugin-yml/commit/40591697f7bb23cad0076ac53b188ca9de7203b0) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for legacy ESLint config format. The plugin now exports flat configuration as the main configuration format. The previous `flat/*` namespace is kept for backward compatibility.

- [#524](https://github.com/ota-meshi/eslint-plugin-yml/pull/524) [`2260263`](https://github.com/ota-meshi/eslint-plugin-yml/commit/2260263247825ddc1e6803fc328a5b5ea53d117c) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for ESLint versions older than 9.38.0. The new supported version is `>=9.38.0`.

- [#522](https://github.com/ota-meshi/eslint-plugin-yml/pull/522) [`dc5028e`](https://github.com/ota-meshi/eslint-plugin-yml/commit/dc5028eb222a1b247d0c51cbb9afbf479d01bdd8) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for Node.js versions older than 20.19.0. The new supported version is `^20.19.0 || ^22.13.0 || >=24`.

- [#526](https://github.com/ota-meshi/eslint-plugin-yml/pull/526) [`3e7cb79`](https://github.com/ota-meshi/eslint-plugin-yml/commit/3e7cb79b9873f50acad785d6ed23233084ed428c) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update `standard` config

- [#523](https://github.com/ota-meshi/eslint-plugin-yml/pull/523) [`50a96f8`](https://github.com/ota-meshi/eslint-plugin-yml/commit/50a96f81e81c53b5648ffe1aae19575fd0ceccb1) Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency yaml-eslint-parser to v2

## 1.19.1

### Patch Changes

- [#506](https://github.com/ota-meshi/eslint-plugin-yml/pull/506) [`736f153`](https://github.com/ota-meshi/eslint-plugin-yml/commit/736f15343788720aa210070f7e78aab3c5ef929d) Thanks [@sumimakito](https://github.com/sumimakito)! - fix(sort-keys): fix incorrect result when move down the block located at the file start

## 1.19.0

### Minor Changes

- [#482](https://github.com/ota-meshi/eslint-plugin-yml/pull/482) [`2dd3bca`](https://github.com/ota-meshi/eslint-plugin-yml/commit/2dd3bcadfc831e651e26750c833abb89193da8ca) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat(sort-keys): improve to calculate the minimum edit distance for sorting and report the optimal sorting direction

- [#482](https://github.com/ota-meshi/eslint-plugin-yml/pull/482) [`2dd3bca`](https://github.com/ota-meshi/eslint-plugin-yml/commit/2dd3bcadfc831e651e26750c833abb89193da8ca) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat(sort-sequence-values): improve to calculate the minimum edit distance for sorting and report the optimal sorting direction

## 1.18.0

### Minor Changes

- [#427](https://github.com/ota-meshi/eslint-plugin-yml/pull/427) [`a61a2a4`](https://github.com/ota-meshi/eslint-plugin-yml/commit/a61a2a478a6810eee7e0c17ce89fab29f0a46897) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: alignMultilineFlowScalar option to indent rule

## 1.17.0

### Minor Changes

- [#406](https://github.com/ota-meshi/eslint-plugin-yml/pull/406) [`91d7a0a`](https://github.com/ota-meshi/eslint-plugin-yml/commit/91d7a0a39775548f81b3bd4bf7f9eb668369df99) Thanks [@SukkaW](https://github.com/SukkaW)! - Replace `lodash` to reduce the package installation size

## 1.16.0

### Minor Changes

- [#385](https://github.com/ota-meshi/eslint-plugin-yml/pull/385) [`5c11866`](https://github.com/ota-meshi/eslint-plugin-yml/commit/5c11866c7f9a994e6677421b31989b0652d701bc) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: changed to prevent crash when used with language plugins

## 1.15.0

### Minor Changes

- [#374](https://github.com/ota-meshi/eslint-plugin-yml/pull/374) [`4790eaf`](https://github.com/ota-meshi/eslint-plugin-yml/commit/4790eaf7c71c20080e1dbc629ba79c08d2d75e47) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `overrides` option to `yml/plain-scalar`

## 1.14.0

### Minor Changes

- [#320](https://github.com/ota-meshi/eslint-plugin-yml/pull/320) [`60123cf`](https://github.com/ota-meshi/eslint-plugin-yml/commit/60123cf4305a1e5d8e8d51bc0bb537732b25137d) Thanks [@Logicer16](https://github.com/Logicer16)! - feat: improved compatibility with `@types/eslint` for flat config.

## 1.13.2

### Patch Changes

- [#316](https://github.com/ota-meshi/eslint-plugin-yml/pull/316) [`49801e9`](https://github.com/ota-meshi/eslint-plugin-yml/commit/49801e9e8a13687bd7deb5748ce44b4abf7480f7) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: incorrect auto-fix in `yml/sort-keys` rule

## 1.13.1

### Patch Changes

- [#311](https://github.com/ota-meshi/eslint-plugin-yml/pull/311) [`417604d`](https://github.com/ota-meshi/eslint-plugin-yml/commit/417604d2351a2fe4fe19b77e611d514e94bfdf93) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: flat config issues

## 1.13.0

### Minor Changes

- [#308](https://github.com/ota-meshi/eslint-plugin-yml/pull/308) [`d2ec358`](https://github.com/ota-meshi/eslint-plugin-yml/commit/d2ec358c01202f78e9a6a06ad9f9b84b72a3d60b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add support for flat config

## 1.12.2

### Patch Changes

- [#297](https://github.com/ota-meshi/eslint-plugin-yml/pull/297) [`9c6ea14`](https://github.com/ota-meshi/eslint-plugin-yml/commit/9c6ea14a2416407e555dbc7b9392074c3f8963cc) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.4.0

## 1.12.1

### Patch Changes

- [#295](https://github.com/ota-meshi/eslint-plugin-yml/pull/295) [`7e09518`](https://github.com/ota-meshi/eslint-plugin-yml/commit/7e09518b13b4ee4bdea7d93020e6fbc65bb842c7) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.3.0

## 1.12.0

### Minor Changes

- [#293](https://github.com/ota-meshi/eslint-plugin-yml/pull/293) [`ce18a37`](https://github.com/ota-meshi/eslint-plugin-yml/commit/ce18a37dc33911c7ecea730c3f028a9a65bd83ad) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.2.0

## 1.11.0

### Minor Changes

- [#288](https://github.com/ota-meshi/eslint-plugin-yml/pull/288) [`d852113`](https://github.com/ota-meshi/eslint-plugin-yml/commit/d8521132623858ebfbef6bee79cda8c6333948db) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Improve compatibility with ESLint v9

## 1.10.0

### Minor Changes

- [#270](https://github.com/ota-meshi/eslint-plugin-yml/pull/270) [`96a031f`](https://github.com/ota-meshi/eslint-plugin-yml/commit/96a031f4989b6da8cf044a5a9bf9e47b1b8d3538) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use eslint-compat-utils

## 1.9.0

### Minor Changes

- [#259](https://github.com/ota-meshi/eslint-plugin-yml/pull/259) [`b73d852`](https://github.com/ota-meshi/eslint-plugin-yml/commit/b73d8529b56c77debe8c8f0e538e40169423c77d) Thanks [@sun-yryr](https://github.com/sun-yryr)! - feat: add `blockMapping` option in `block-sequence-hyphen-indicator-newline`

## 1.8.0

### Minor Changes

- [#247](https://github.com/ota-meshi/eslint-plugin-yml/pull/247) [`2b9f295`](https://github.com/ota-meshi/eslint-plugin-yml/commit/2b9f295ccd24c603d6413b2406a1af241f306dce) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `allowLineSeparatedGroups` option to the `yml/sort-keys` rule

## 1.7.0

### Minor Changes

- [#238](https://github.com/ota-meshi/eslint-plugin-yml/pull/238) [`6033d9c`](https://github.com/ota-meshi/eslint-plugin-yml/commit/6033d9c6130f08ff5667ffa712a63b74244a4b48) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: export meta object

## 1.6.0

### Minor Changes

- [#236](https://github.com/ota-meshi/eslint-plugin-yml/pull/236) [`7e34b77`](https://github.com/ota-meshi/eslint-plugin-yml/commit/7e34b7748a4e3663ab56dc504214ba613b3f8347) Thanks [@sxyazi](https://github.com/sxyazi)! - feat: add `yml/no-trailing-zeros` rule

## 1.5.0

### Minor Changes

- [#216](https://github.com/ota-meshi/eslint-plugin-yml/pull/216) [`815aa61`](https://github.com/ota-meshi/eslint-plugin-yml/commit/815aa61174e9d4f4744516dede7cc45a5b82eab1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `indicatorValueIndent` option to `yml/indent` rule

## 1.4.0

### Minor Changes

- [#205](https://github.com/ota-meshi/eslint-plugin-yml/pull/205) [`ea2c472`](https://github.com/ota-meshi/eslint-plugin-yml/commit/ea2c47271cbd8ea921a71a73c57dd7c097cec15b) Thanks [@danielrentz](https://github.com/danielrentz)! - disable `no-unused-vars` in base config

## 1.3.0

### Minor Changes

- [#200](https://github.com/ota-meshi/eslint-plugin-yml/pull/200) [`8e82601`](https://github.com/ota-meshi/eslint-plugin-yml/commit/8e82601b85aebb0d4487592ce8b0349788a00266) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `indentBlockSequences` option to `yml/indent` rule

## 1.2.0

### Minor Changes

- [#186](https://github.com/ota-meshi/eslint-plugin-yml/pull/186) [`e9fbf41`](https://github.com/ota-meshi/eslint-plugin-yml/commit/e9fbf41d0469d25ba5d423789f7461abdd1eeadc) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `yml/block-mapping-colon-indicator-newline` rule

- [#188](https://github.com/ota-meshi/eslint-plugin-yml/pull/188) [`2691fab`](https://github.com/ota-meshi/eslint-plugin-yml/commit/2691fabcf22b0218f4da466eff923d9b783e3f8f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `yml/file-extension` rule
