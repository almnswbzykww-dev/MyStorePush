---
name: Windows release packaging
description: Portable archive constraints for the store's Windows release.
---

Portable ZIP releases must contain a flat, self-contained `node_modules` tree; pnpm's symlinked workspace layout can break after extraction on another machine.

**Why:** A release built by copying pnpm's workspace `node_modules` may pass locally but fail after ZIP extraction when transitive package links cannot resolve.

**How to apply:** Use a production dependency install inside the release staging directory, validate the archive with `unzip -t`, and smoke-test the extracted bundle before presenting it.