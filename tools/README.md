# Codekin development tools

The repository includes deterministic tools for validating content and reproducing engine behavior. They run on the same Content API, mechanics contracts, and authoritative reducer used by the plugin.

## Renderer interaction checks

`pnpm check` includes display spring stability at 30/60/144 fps, bounded release momentum, keyboard board boundaries, local preference recovery, and normalized roster search. Renderer physics never update engine state or consume its random source.

`pnpm lifecycle:dsh` also checks the installed UI in Chrome/Edge: lounge interaction and story unlocks, dialog focus and Escape, roster search/reset, squad editing, arrow-key navigation, saved animation preferences, and launcher focus restoration. For a visual review, check lounge, map, tower, roster, details and battle at both desktop and 390×844, then exercise a valid/invalid swap, window/launcher dragging, unsaved squad navigation, and capture rewards using an isolated DSH profile.

## Content-pack lint

```sh
pnpm content:lint
```

The default command validates the bundled core pack. It checks the JSON schema, SemVer and dependency graph, cross-pack references, reviewed mechanics opcodes and parameters, asset paths, file signatures, and asset-size limits. To validate one or more modules explicitly:

```sh
node tools/content-pack-lint.ts \
  --asset-root "@nath-vikky/codekin-core=assets/creatures" \
  "content-packs/core/src/index.ts#CORE_CONTENT_PACK"
```

Use `--json` or `--output <report.json>` for a machine-readable `codekin-pack-lint-v1` report. Every pack containing assets needs a matching `--asset-root <pack-id>=<directory>` entry.

## Replay

```sh
pnpm replay -- tests/fixtures/replays/core-smoke-v1.json
```

A `codekin-replay-v1` transcript records the deterministic random algorithm and seed, optional engine/content identities, an optional initial state, and ordered signal/action steps. Optional final revision and SHA-256 expectations make a transcript suitable for regression gates. Use `--json` for step digests or `--state-out <state.json>` to export the final authoritative state.

## Simulation

```sh
pnpm simulate
pnpm simulate -- --check --output simulation-report.json
```

The default `codekin-simulation-v1` report runs seven combat scenarios over 24 fixed seeds. `--check` applies the repository's pacing and danger thresholds; `--seeds` and `--seed` select larger deterministic runs. The command never uses user-controlled randomness or live DSH state.

## Performance and size budgets

```sh
pnpm build
pnpm performance -- --check --output performance-report.json
```

The `codekin-performance-v1` report measures a typical authoritative battle action, a 750-Codekin restore, content-registry construction, the fixed simulation matrix, browser and total JavaScript bundles, core assets, and large-roster JSON size. Cross-platform release ceilings live in `performance-budget.json`; timing gates use p95 samples and intentionally leave headroom for shared CI hosts.

The in-window settings feature adds approximately 4 KB gzip to the 89.37 KB graphic-UI client for bilingual controls, preference persistence and the settings dialog. Its compressed-client ceiling is 95,000 bytes; the 400,000-byte raw-client ceiling and all engine, image and save budgets remain unchanged. Settings add no dependencies or image downloads.

The core image budget is 4 MB for the launcher, 25 original sprites, 25 transparent 768px evolution portraits, and five ultimate scene/silhouette pairs. Appearance images use WebP with preserved alpha. Ultimate scenes retain the character's themed environment while removing the outer paper background; separate alpha masks keep the charged battle glow on the character outline. Review galleries, source masters, and processing prompts remain outside the repository and package. Appearance changes do not add gameplay random draws or alter combat values.

## Installed DSH lifecycle

```sh
pnpm lifecycle:dsh
pnpm lifecycle:dsh --with-dsh-web 0.3.23
```

This release gate creates an isolated DSH Web `0.1.5-rc.1` profile, installs a local package tarball, starts the host, exercises the state and action routes, runs a headless Chrome/Edge roster and keyboard-accessibility smoke test, disables Codekin, restarts DSH, removes and reinstalls the plugin, and verifies that the same save and starter survive every transition. `--with-dsh-web 0.3.23` first installs and verifies that exact aggregate version, then runs the same lifecycle with both plugins present. CI uses this combined path for tarballs and the standalone path for Git sources. Pass `--source <package-spec>` to test a Git commit, release tarball, or registry package through the same path. Failed runs retain their temporary profile for diagnosis; successful runs remove it unless `--keep` is supplied. `--skip-browser` is available for host-only diagnosis but is not used by the release gate.

The September 16, 2026 release targets dsh-web `0.3.23`, whose [desktop host manifest](https://github.com/zhu1090093659/dsh-web/blob/v0.3.23/desktop/runtime/host/package.json) still pins DSH `0.1.5-rc.1`. Codekin's minimum and SDK baseline therefore stay at that version. Settings are tested through the in-window dialog; older published clients retain their header motion control in the same smoke test.

The September 14, 2026 compatibility check also installs the already-published package directly:

```sh
pnpm lifecycle:dsh --with-dsh-web 0.3.22 --source @nath-vikky/dsh-codekin@0.3.8-rc.1
```

For the lounge version, the browser smoke emulates OS reduced motion and verifies that the first open still plays full animations. It then checks both explicit reduced and full preferences across reloads, including portrait visibility, saved bond progress and read status. Older published packages remain testable with their previous system-default behavior. Battle timing lives in `packages/renderer-react/src/battle-motion.ts`; reduced motion removes travel without removing turn and protocol reading time.
