import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import semver from 'semver'
import { CODEKIN_PACKAGE } from '../../../src/update-contract.ts'
import type { CodekinUpdateReport } from '../../../src/update-contract.ts'

const REGISTRY = 'https://registry.npmjs.org/@nath-vikky%2Fdsh-codekin'
const CACHE_MS = 6 * 60 * 60 * 1000
const RETRY_MS = 15 * 60 * 1000
const MANUAL_COOLDOWN_MS = 60_000
const MAX_METADATA_BYTES = 4 * 1024 * 1024
// These immutable early releases used the retired dsh-client-runtime API but
// advertised ^0.1.0, which overstates compatibility with later 0.1.x hosts.
// Keep them on the exact Host verified for that release (README version table).
const HISTORICAL_DSH_RANGES: Readonly<Record<string, string>> = {
  '0.2.0-rc.5': '0.1.0-rc.5',
  '0.2.0': '0.1.0-rc.5',
}

type Manifest = Record<string, unknown>
function record(value: unknown): Manifest | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Manifest : undefined
}
function version(value: unknown): string | null {
  return typeof value === 'string' && value.length < 128 && semver.valid(value) ? value : null
}
function manifestAt(filename: string): Manifest | undefined {
  try { return record(JSON.parse(readFileSync(filename, 'utf8'))) } catch { return undefined }
}
function nearestManifest(entry: string, name: string): Manifest | undefined {
  let directory = dirname(entry)
  for (let depth = 0; depth < 18; depth++) {
    const data = manifestAt(join(directory, 'package.json'))
    if (data?.name === name) return data
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }
  return undefined
}
function resolvedManifest(anchor: string, name: string): Manifest | undefined {
  try {
    const data = manifestAt(createRequire(anchor).resolve(`${name}/package.json`))
    return data?.name === name ? data : undefined
  } catch { return undefined }
}

export interface CodekinRuntimeInfo {
  manifest: Manifest
  dshVersion: string | null
  dshWebVersion: string | null
}

/** Resolve app-boot from the running CLI, not a bundled SDK or the workspace's npm version. */
export function detectCodekinRuntime(entry = process.argv[1], plugin = fileURLToPath(import.meta.url)): CodekinRuntimeInfo {
  const own = nearestManifest(plugin, CODEKIN_PACKAGE) ?? {}
  let anchor: string | undefined
  try { if (entry) anchor = realpathSync(resolve(entry)) } catch { /* an embedded host may have no CLI file */ }
  const boot = anchor ? resolvedManifest(anchor, '@deepseek-ai/dsh-app-boot') : undefined
  const cli = anchor ? nearestManifest(anchor, '@deepseek-ai/dsh') : undefined
  const web = resolvedManifest(plugin, '@linxin666/dsh-web-all')
    ?? (anchor ? resolvedManifest(anchor, '@linxin666/dsh-web-all') : undefined)
  return { manifest: own, dshVersion: version(boot?.version) ?? version(cli?.version), dshWebVersion: version(web?.version) }
}

function dshRange(manifest: Manifest): string | null {
  const range = record(record(manifest.dsh)?.engines)?.dsh
  return typeof range === 'string' && range.length < 512 && semver.validRange(range) !== null ? range : null
}

/** Match both the package declaration and every SDK peer, like DSH's loader. */
export function supportsDsh(manifest: Manifest, host: string): boolean {
  const range = dshRange(manifest)
  if (!range || !version(host) || !semver.satisfies(host, range, { includePrerelease: true })) return false
  const historical = typeof manifest.version === 'string' ? HISTORICAL_DSH_RANGES[manifest.version] : undefined
  if (historical && !semver.satisfies(host, historical, { includePrerelease: true })) return false
  const peers = record(manifest.peerDependencies)
  if (manifest.peerDependencies !== undefined && !peers) return false
  return Object.entries(peers ?? {}).every(([name, requirement]) => {
    if (name !== '@deepseek-ai/dsh' && !name.startsWith('@deepseek-ai/dsh-')) return true
    return typeof requirement === 'string' && requirement.length < 512 && requirement.trim() !== ''
      && semver.validRange(requirement) !== null && semver.satisfies(host, requirement, { includePrerelease: true })
  })
}

export function newestCompatibleCodekin(metadata: unknown, host: string, installed: string | null): string | null {
  const root = record(metadata)
  const versions = record(root?.versions)
  if (root?.name !== CODEKIN_PACKAGE || !versions) throw new TypeError('Invalid package metadata')
  const installedChannel = installed ? semver.prerelease(installed)?.[0] : undefined
  let newest: string | null = null
  for (const [key, value] of Object.entries(versions)) {
    const row = record(value)
    if (!row || row.name !== CODEKIN_PACKAGE || version(row.version) !== key || row.deprecated) continue
    const prerelease = semver.prerelease(key)
    // Stable and RC releases are normal updates. Experimental builds stay opt-in.
    if (prerelease && prerelease[0] !== 'rc' && prerelease[0] !== installedChannel) continue
    if (supportsDsh(row, host) && (newest === null || semver.gt(key, newest))) newest = key
  }
  return newest
}

async function readRegistry(fetcher: typeof fetch, signal: AbortSignal): Promise<unknown> {
  const response = await fetcher(REGISTRY, {
    headers: { accept: 'application/json' }, redirect: 'error', credentials: 'omit', signal,
  })
  if (!response.ok || !response.body) throw new Error('Registry unavailable')
  const reader = response.body.getReader()
  const parts: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > MAX_METADATA_BYTES) throw new Error('Registry response too large')
      parts.push(chunk.value)
    }
  } finally { await reader.cancel().catch(() => undefined) }
  return JSON.parse(Buffer.concat(parts).toString('utf8')) as unknown
}

export class CodekinUpdateChecker {
  private report: CodekinUpdateReport
  private pending: Promise<void> | undefined
  private lastAttempt: number | undefined
  private closed = false
  private readonly controller = new AbortController()

  constructor(info: CodekinRuntimeInfo, private readonly fetcher = fetch, private readonly now = Date.now) {
    this.report = {
      format: 'codekin-updates-v1', installedVersion: version(info.manifest.version),
      dshVersion: info.dshVersion, dshWebVersion: info.dshWebVersion, supportedDsh: dshRange(info.manifest),
      compatible: info.dshVersion ? supportsDsh(info.manifest, info.dshVersion) : null,
      status: info.dshVersion ? 'idle' : 'host-unknown', latestCompatibleVersion: null, updateAvailable: false, checkedAt: null,
    }
  }

  snapshot(): CodekinUpdateReport { return { ...this.report } }

  /** Coalesced, bounded metadata checks; no installer, shell, or game-state access. */
  async check(manual = false): Promise<void> {
    if (this.closed || !this.report.dshVersion) return
    if (this.pending) return this.pending
    const cooldown = manual ? MANUAL_COOLDOWN_MS : this.report.status === 'unavailable' ? RETRY_MS : CACHE_MS
    if (this.lastAttempt !== undefined && this.now() - this.lastAttempt < cooldown) return
    this.lastAttempt = this.now()
    this.report = { ...this.report, status: 'checking' }
    this.pending = (async () => {
      try {
        const metadata = await readRegistry(this.fetcher, AbortSignal.any([this.controller.signal, AbortSignal.timeout(8_000)]))
        const latest = newestCompatibleCodekin(metadata, this.report.dshVersion!, this.report.installedVersion)
        if (this.closed) return
        this.report = { ...this.report, status: 'ok', checkedAt: this.now(), latestCompatibleVersion: latest,
          updateAvailable: latest !== null && this.report.installedVersion !== null && semver.gt(latest, this.report.installedVersion) }
      } catch {
        if (!this.closed) this.report = { ...this.report, status: 'unavailable', checkedAt: this.now() }
      } finally { this.pending = undefined }
    })()
    return this.pending
  }

  close(): void { this.closed = true; this.controller.abort() }
}
