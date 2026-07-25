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
3. The `Test` workflow runs tests and documentation validation. Only after it succeeds does the separate publish workflow verify package contents, publish the exact tested commit to npm, and create the matching `v<version>` tag.

The workflow rejects mismatched manifest versions and refuses to republish an existing npm version. Publishing never begins until `Test` has passed.
