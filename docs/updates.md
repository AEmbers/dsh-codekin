# Version matching and update notices

[简体中文](updates.zh-CN.md) · [Codekin versions on npm](https://www.npmjs.com/package/@nath-vikky/dsh-codekin?activeTab=versions)

This feature is available starting in Codekin `0.4.0-rc.1`. The earlier `0.3.9-rc.1` has neither update detection nor support for DSH `0.1.7-rc.1`.

## Compatibility targets checked on September 24, 2026

| DSH channel | DSH | Matched dsh-web |
| --- | --- | --- |
| npm `latest` | `0.1.5-rc.3` | `@linxin666/dsh-web-all@0.3.24` |
| npm `next` / new RC | `0.1.7-rc.1` | `@linxin666/dsh-web-all@0.4.1` |

dsh-web `0.4.1` requires DSH `>=0.1.7-rc.1`; it does not match the older `latest` channel. These are dated snapshots, not hard-coded update recommendations. Sources: [DSH releases](https://github.com/deepseek-ai/deepseek-harness/releases), [dsh-web 0.4.1's pinned desktop runtime](https://github.com/zhu1090093659/dsh-web/blob/v0.4.1/desktop/runtime/host/package.json), and their public npm manifests.

Version `0.4.0-rc.1` supports `>=0.1.5-rc.1 <0.1.6-0 || >=0.1.7-rc.1 <0.1.8-0`. This excludes unverified `0.1.6`, `0.1.7-alpha`, and future `0.1.8` prereleases.

## Compatibility declaration from 0.4.1

The open-ended `0.1.5-rc.1 <0.1.6-0 || 0.1.7-rc.1 <0.1.8-0` whitelists above were rejected by the
DSH `0.2.1-alpha.1` install gate: the gate compares the host version against the declared
`peerDependencies` ranges, and no branch covered `0.2.0-rc.x` or `0.2.1-alpha.x`.

Codekin `0.4.1` therefore declares:

- `engines.dsh` and `dsh.compatibility.dsh` = `>=0.1.5-rc.1` (one open range instead of a
  per-version whitelist);
- `dsh.compatibility.dshReleases` listing every release from `0.1.5-rc.1` through
  `0.2.1-alpha.1` as `compatible`, so both the `0.2.0-rc.x` line and the `0.2.1-alpha.x` line
  are declared explicitly;
- `peerDependencies` DSH entries as `*`.

Verified on 2026-10-04 against both cores: DSH `0.2.1-alpha.1` and DSH `0.2.0-rc.2` each
installed the package without an `incompatible` rejection and mounted Codekin's client bundle.

## Updating manually

Codekin checks on startup. A compatible newer release produces an **Update** notice beside **Settings**. Open it, or visit **Settings → Updates**, to inspect the installed Codekin, running DSH, compatible release and download links. The npm link points to the exact selected version. Select the displayed package/version in the DSH plugin manager, then reopen Codekin.

This is notification-only. It never runs an installer, upgrades DSH, changes plugin settings, or edits saves. The sole external request reads public metadata from a fixed official npm URL. It sends no version query, save, conversation, prompt, path or token.

## How selection works

The Host resolves the running CLI's `dsh-app-boot` version, rather than guessing from a workspace package or bundled SDK. Candidate releases must satisfy both `dsh.engines.dsh` and every DSH SDK peer, using the loader's prerelease comparison rules. Deprecated releases are skipped. Stable and RC releases are eligible; other experimental channels are only eligible when the installed version already uses that channel.

The immutable `0.2.0-rc.5` and `0.2.0` packages advertised an overbroad `^0.1.0` SDK range. They are additionally restricted to the verified DSH `0.1.0-rc.5` pairing; their retired APIs must not be offered to newer Hosts.

The highest compatible semantic version wins, independently of npm's `latest` tag. An incompatible installation may be offered an older compatible release, but never downgraded automatically. Unknown Host versions, registry outages and absent compatible releases are separate states and never reported as up-to-date. A compatible development build may exist before a matching npm release is published.

The Host coalesces clients and caches results for six hours. Network failures back off for 15 minutes; manual checks have a one-minute minimum interval. Requests time out after eight seconds, enforce a 4 MiB response limit, and abort when the plugin unloads.

## Startup failures

If the entry point loads but the game service fails, its response format is incompatible, or the game renderer throws, startup help provides version information and download links. Confirmed mismatches open compatibility guidance automatically. Temporary disconnections retain retry/help controls instead of being misdiagnosed as version incompatibility.

**A plugin cannot display its own dialog if DSH refuses to execute it at all.** DSH `0.1.7-rc.1` checks SDK peers before loading plugin code; a disabled plugin or blocked browser script has the same limitation. Use DSH's plugin manager to read its compatibility diagnostic, then obtain a matching package from [npm versions](https://www.npmjs.com/package/@nath-vikky/dsh-codekin?activeTab=versions) or [GitHub releases](https://github.com/Nath-Vikky/dsh-codekin/releases). A version exemption or save deletion is not needed.

Codekin does not modify the DSH loader or bypass its compatibility checks. Automatic guidance when no plugin code executes requires a Host-level feature in DSH or dsh-web.
