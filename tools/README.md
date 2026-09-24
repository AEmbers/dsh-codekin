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

`node tools/expedition-simulation.ts --check --output expedition-report.json` runs 576 seven-node expeditions: 24 fixed seeds across three build families, four solo/new/level-30/level-60 profiles, and two route policies. The novice policy uses the first legal swap, ready skills, one support per battle and interference-then-guard module targeting. The safe policy takes repair/stock/repair. The risk policy takes charge/elite, buys a forge perk when healthy and sabotages the finale when healthy. Safe-route gates require 80% tutorial and 60% ordinary completion; the optional risk route requires 40%. All scenarios must stay below 300 actions on average for four fights. It does not measure human play time or optimized tactics. This gate also runs in `pnpm check`.

## Performance and size budgets

```sh
pnpm build
pnpm performance -- --check --output performance-report.json
```

The `codekin-performance-v1` report measures a typical authoritative battle action, a 750-Codekin restore, content-registry construction, the fixed simulation matrix, browser and total JavaScript bundles, core assets, and large-roster JSON size. Cross-platform release ceilings live in `performance-budget.json`; timing gates use p95 samples and intentionally leave headroom for shared CI hosts.

The expedition development branch allows 445,000 raw client bytes and 126,000 gzip bytes. Unknown-route presentation, terminal reveal, permanent per-Boss recruitment and the XP shop brought the client to approximately 422 KB raw / 118 KB gzip. The bilingual version panel, download guidance and startup fallback add approximately 11 KB raw / 4 KB gzip (measured client: 433,280 raw bytes / 122,178 gzip bytes). No new runtime dependency is added. Engine timing, total JavaScript and save budgets stay unchanged. Six approved transparent Boss portraits are loaded when revealed or unlocked; unknown discovery cards request no Boss portrait.

The core image budget is 6 MB for the launcher, 25 original sprites, 25 transparent 768px evolution portraits, five ultimate scene/silhouette pairs and six recruitable Boss portraits. Each Boss currently has one authored form. The five newly integrated WebP portraits add about 1.47 MB; their PNG source masters remain outside the package. Appearance images preserve alpha. Ultimate scenes retain the character's themed environment while removing the outer paper background; separate alpha masks keep the charged battle glow on the character outline. Review galleries and processing prompts remain outside the repository and package. Appearance changes do not add gameplay random draws or alter combat values.

## Installed DSH lifecycle

```sh
pnpm lifecycle:dsh
pnpm lifecycle:dsh --with-dsh-web 0.4.1
```

This release gate creates an isolated DSH Web `0.1.7-rc.1` profile, installs a local package tarball, starts the host, exercises the state, action and update routes, runs a headless Chrome/Edge roster and keyboard-accessibility smoke test, disables Codekin, restarts DSH, removes and reinstalls the plugin, and verifies that the same save and starter survive every transition. `--with-dsh-web 0.4.1` first installs and verifies that exact aggregate version, then runs the same lifecycle with both plugins present. CI uses this combined path for tarballs and the standalone path for Git sources. Pass `--source <package-spec>` to test a Git commit, release tarball, or registry package through the same path. Failed runs retain their temporary profile for diagnosis; successful runs remove it unless `--keep` is supplied. `--skip-browser` is available for host-only diagnosis but is not used by the release gate.

The Codekin `0.4.0-rc.1` baseline uses DSH `0.1.7-rc.1` SDKs and dsh-web `0.4.1`. The lifecycle matrix also covers npm's current `latest` DSH `0.1.5-rc.3` with dsh-web `0.3.24`. Use `--dsh-version` to choose the Host independently of development dependencies. The update route must report that actual Host version. The prior September 16 npm release used dsh-web `0.3.23` with DSH `0.1.5-rc.1`. Settings are tested through the in-window dialog; older published clients retain their header motion control in the same smoke test.

The September 14, 2026 compatibility check also installs the already-published package directly:

```sh
pnpm lifecycle:dsh --with-dsh-web 0.3.22 --source @nath-vikky/dsh-codekin@0.3.8-rc.1
```

For the lounge version, the browser smoke emulates OS reduced motion and verifies that the first open still plays full animations. It then checks both explicit reduced and full preferences across reloads, including portrait visibility, saved bond progress and read status. Older published packages remain testable with their previous system-default behavior. Battle timing lives in `packages/renderer-react/src/battle-motion.ts`; reduced motion removes travel without removing turn and protocol reading time.
