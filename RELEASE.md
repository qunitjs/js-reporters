# Release Process

1. Update `CHANGELOG.md` using `git changelog` from the [`git-extras`](https://github.com/tj/git-extras) package. Edit the changelog file as needed, and stage the changes.
2. Update `package.json` version, and stage the changes.
3. Commit with message `Release X.Y.Z`, and create a signed tag `git tag -s "vX.Y.Z" -m "Release X.Y.Z"`
4. Push the commit and tag to GitHub.
5. Run `npm publish`.
6. Publish a new [release on GitHub](https://github.com/js-reporters/js-reporters/releases) with a copy of the changelog.

That's all!
