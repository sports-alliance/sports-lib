# Releasing

Publishing is handled by `.github/workflows/publish.yml`.

## One-time setup

1. In the npm package settings for `@sports-alliance/sports-lib`, add a GitHub Actions Trusted Publisher:
   - Organization: `sports-alliance`
   - Repository: `sports-lib`
   - Workflow filename: `publish.yml`
   - Environment: `npm`
   - Allowed action: `npm publish`
2. Set the GitHub repository variable `NPM_PUBLISH_ENABLED` to `true` after the Trusted Publisher has been configured and verified.
3. Prefer npm's package setting **Require two-factor authentication and disallow tokens** once the first trusted publish succeeds.

## Normal release flow

1. Update `package.json` and `package-lock.json` to the intended semantic version in the same pull request.
2. Merge that change into `main`.
3. CI runs tests, documentation validation, and a package-content check, then publishes the new version to npm and creates the matching `v<version>` tag.

The workflow rejects mismatched manifest versions and refuses to republish a version from a branch push. A manually pushed `v<version>` tag is also supported for recovery or for publishing a version that was bumped before the workflow was introduced.
