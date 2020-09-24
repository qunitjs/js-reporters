# Release Process

1. Update `CHANGELOG.md`
 * Run the following command, substituting `v1.2.3` for the last release tag.
   `git log --format="* %s. (%aN)" --no-merges v1.2.3...HEAD | sort`
 * Copy the output to a changelog section at the top of the file.
 * Remove entries that don't affect users of the  package (e.g. "Build", "Test", or "Spec").
 * Format using [Keep a changelog](https://keepachangelog.com/en/1.0.0/) conventions.
2. Update `package.json` version, and stage the changes.
3. Commit with message `Release X.Y.Z`, and create a signed tag `git tag -s "vX.Y.Z" -m "Release X.Y.Z"`
4. Push the commit and tag to GitHub.
5. Run `npm publish`.
6. Publish a new [release on GitHub](https://github.com/js-reporters/js-reporters/releases) with a copy of the changelog.

That's all!
