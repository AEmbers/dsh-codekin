import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodekinUpdateChecker, detectCodekinRuntime, newestCompatibleCodekin, supportsDsh } from '../packages/dsh-adapter/src/updates.ts'
import { CODEKIN_PACKAGE, codekinVersionUrl } from '../src/update-contract.ts'
import { createCodekinUpdateRoutes } from '../packages/dsh-adapter/src/routes.ts'
import type { IncomingMessage, ServerResponse } from 'node:http'

const own = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const roots: string[] = []
afterEach(() => {
  for (const root of roots.splice(0)) {
    if (!resolve(root).startsWith(resolve(join(tmpdir(), 'codekin-updates-')))) throw new Error('Unexpected test path')
    rmSync(root, { recursive: true, force: true })
  }
})
const release = (version: string, dsh: string, peers: Record<string, string> = {}) => ({
  name: CODEKIN_PACKAGE, version, dsh: { engines: { dsh } }, peerDependencies: peers,
})
const old = release('0.3.9-rc.1', '>=0.1.5-rc.1', { '@deepseek-ai/dsh-session': '>=0.1.5-rc.1 <0.1.5' })
const next = release('0.4.0-rc.1', '>=0.1.7-rc.1 <0.1.8')
const registry = { name: CODEKIN_PACKAGE, 'dist-tags': { latest: '0.7.0' }, versions: {
  [old.version]: old, [next.version]: next,
  '0.7.0': release('0.7.0', '>=0.2.0'),
  '0.6.0-alpha.1': release('0.6.0-alpha.1', '>=0.1.7-rc.1'),
  '0.5.0': { ...release('0.5.0', '>=0.1.7-rc.1'), deprecated: 'withdrawn' },
} }

describe('compatible update selection', () => {
  it('does not trust the overbroad SDK ranges in immutable 0.2 releases', () => {
    for (const v of ['0.2.0-rc.5', '0.2.0']) {
      const legacy = release(v, '>=0.1.0-rc.5 <0.2.0', { '@deepseek-ai/dsh-client-runtime': '^0.1.0-rc.5' })
      const data = { name: CODEKIN_PACKAGE, versions: { [v]: legacy } }
      expect(newestCompatibleCodekin(data, '0.1.7-rc.1', own.version)).toBeNull()
      expect(newestCompatibleCodekin(data, '0.1.5-rc.3', own.version)).toBeNull()
      expect(newestCompatibleCodekin(data, '0.1.0-rc.5', v)).toBe(v)
    }
  })
  it('uses SDK peers as well as engines and never blindly follows latest', () => {
    expect(newestCompatibleCodekin(registry, '0.1.5-rc.3', '0.3.8-rc.1')).toBe('0.3.9-rc.1')
    expect(supportsDsh(old, '0.1.7-rc.1')).toBe(false)
    expect(newestCompatibleCodekin(registry, '0.1.7-rc.1', '0.3.9-rc.1')).toBe('0.4.0-rc.1')
    expect(newestCompatibleCodekin(registry, '0.1.2-rc.1', '0.3.7-rc.1')).toBeNull()
    expect(newestCompatibleCodekin(registry, '0.1.7-rc.1', '0.4.0-alpha.1')).toBe('0.6.0-alpha.1')
  })
  it('validates the package identity, version identity and compatibility metadata', () => {
    expect(() => newestCompatibleCodekin({ ...registry, name: 'unrelated' }, '0.1.7-rc.1', null)).toThrow()
    for (const row of [
      { ...next, name: 'unrelated' }, { ...next, version: '9.0.0' }, { ...next, dsh: {} },
      { ...next, peerDependencies: { '@deepseek-ai/dsh-session': '*' , '@deepseek-ai/dsh-client-locale': '' } },
      { ...next, peerDependencies: { '@deepseek-ai/dsh-session': 'not-a-range' } },
    ]) expect(newestCompatibleCodekin({ name: CODEKIN_PACKAGE, versions: { [next.version]: row } }, '0.1.7-rc.1', null)).toBeNull()
    expect(codekinVersionUrl('javascript:alert(1)')).toContain('https://www.npmjs.com/package/')
    expect(codekinVersionUrl('0.4.0-rc.1')).toBe('https://www.npmjs.com/package/@nath-vikky/dsh-codekin/v/0.4.0-rc.1')
  })
  it.each(['0.1.5-rc.1', '0.1.5-rc.3', '0.1.7-rc.1'])('declares support for the maintained DSH line %s', (host: string) => {
    expect(supportsDsh(own, host)).toBe(true)
  })
  it.each(['0.1.4', '0.1.7-alpha.2', '0.1.8-rc.1', 'not-a-version'])('does not promise untested DSH %s', (host: string) => {
    expect(supportsDsh(own, host)).toBe(false)
  })
})

describe('running Host detection', () => {
  it('reads the boot package used by the CLI, not the plugin SDK or an npm workspace version', () => {
    const root = mkdtempSync(join(tmpdir(), 'codekin-updates-')); roots.push(root)
    const cli = join(root, 'cli'), plugin = join(root, 'profile', 'node_modules', '@nath-vikky', 'dsh-codekin')
    const boot = join(cli, 'node_modules', '@deepseek-ai', 'dsh-app-boot')
    for (const directory of [cli, plugin, boot]) mkdirSync(directory, { recursive: true })
    writeFileSync(join(cli, 'main.js'), '')
    writeFileSync(join(cli, 'package.json'), JSON.stringify({ name: '@deepseek-ai/dsh', version: '0.1.5-rc.3' }))
    writeFileSync(join(boot, 'package.json'), JSON.stringify({ name: '@deepseek-ai/dsh-app-boot', version: '0.1.7-rc.1' }))
    writeFileSync(join(plugin, 'package.json'), JSON.stringify(own))
    const detected = detectCodekinRuntime(join(cli, 'main.js'), join(plugin, 'lib', 'index.js'))
    expect(detected.dshVersion).toBe('0.1.7-rc.1')
    expect(detected.manifest.version).toBe(own.version)
    expect(detectCodekinRuntime(join(root, 'missing.js'), join(plugin, 'lib', 'index.js')).dshVersion).toBeNull()
  })
})

describe('notification-only metadata checks', () => {
  it('coalesces clients, caches successes, throttles manual checks and uses only the public registry', async () => {
    let now = 1_000_000
    const fetcher = vi.fn(async () => new Response(JSON.stringify(registry)))
    const checker = new CodekinUpdateChecker({ manifest: { ...own, version: '0.3.9-rc.1' }, dshVersion: '0.1.7-rc.1', dshWebVersion: '0.4.1' }, fetcher, () => now)
    await Promise.all([checker.check(), checker.check(), checker.check(true)])
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]).toMatchObject(['https://registry.npmjs.org/@nath-vikky%2Fdsh-codekin', { credentials: 'omit', redirect: 'error' }])
    expect(checker.snapshot()).toMatchObject({ status: 'ok', compatible: true, updateAvailable: true, latestCompatibleVersion: '0.4.0-rc.1' })
    now += 30_000; await checker.check(true); expect(fetcher).toHaveBeenCalledTimes(1)
    now += 30_001; await checker.check(); expect(fetcher).toHaveBeenCalledTimes(1)
    await checker.check(true); expect(fetcher).toHaveBeenCalledTimes(2)
    checker.close(); now += 7 * 60 * 60_000; await checker.check(); expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('keeps compatibility facts during network failures and backs off without claiming up-to-date', async () => {
    let now = 100_000
    const fetcher = vi.fn(async () => { throw new Error('offline') })
    const checker = new CodekinUpdateChecker({ manifest: old, dshVersion: '0.1.7-rc.1', dshWebVersion: null }, fetcher, () => now)
    await checker.check()
    expect(checker.snapshot()).toMatchObject({ status: 'unavailable', compatible: false, latestCompatibleVersion: null, updateAvailable: false })
    now += 14 * 60_000; await checker.check(); expect(fetcher).toHaveBeenCalledTimes(1)
    now += 2 * 60_000; await checker.check(); expect(fetcher).toHaveBeenCalledTimes(2)
    checker.close()
  })
  it('does not contact the registry or guess an update when Host detection fails', async () => {
    const fetcher = vi.fn()
    const checker = new CodekinUpdateChecker({ manifest: own, dshVersion: null, dshWebVersion: null }, fetcher)
    await checker.check(true)
    expect(fetcher).not.toHaveBeenCalled()
    expect(checker.snapshot()).toMatchObject({ status: 'host-unknown', compatible: null, updateAvailable: false })
    checker.close()
  })
  it('distinguishes no compatible release from a current or newer local build', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ name: CODEKIN_PACKAGE, versions: { [old.version]: old } })))
    const checker = new CodekinUpdateChecker({ manifest: own, dshVersion: '0.1.7-rc.1', dshWebVersion: null }, fetcher)
    await checker.check()
    expect(checker.snapshot()).toMatchObject({ status: 'ok', compatible: true, latestCompatibleVersion: null, updateAvailable: false })
    const newer = new CodekinUpdateChecker({ manifest: { ...own, version: '0.9.0-rc.1' }, dshVersion: '0.1.5-rc.3', dshWebVersion: null }, fetcher)
    await newer.check()
    expect(newer.snapshot()).toMatchObject({ latestCompatibleVersion: old.version, updateAvailable: false })
    checker.close(); newer.close()
  })
  it('bounds responses and aborts an in-flight request when the plugin unloads', async () => {
    const large = new CodekinUpdateChecker({ manifest: own, dshVersion: '0.1.7-rc.1', dshWebVersion: null }, async () => new Response('x'.repeat(4 * 1024 * 1024 + 1)))
    await large.check(); expect(large.snapshot().status).toBe('unavailable'); large.close()
    let signal: AbortSignal | undefined
    const fetcher: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
      signal = init?.signal as AbortSignal
      signal.addEventListener('abort', () => { reject(new Error('aborted')) }, { once: true })
    })
    const checker = new CodekinUpdateChecker({ manifest: own, dshVersion: '0.1.7-rc.1', dshWebVersion: null }, fetcher)
    const pending = checker.check(); checker.close(); await pending
    expect(signal?.aborted).toBe(true)
  })
  it('rejects foreign-origin callers before checks and leaves game routes independent', async () => {
    const fetcher = vi.fn()
    const checker = new CodekinUpdateChecker({ manifest: own, dshVersion: '0.1.7-rc.1', dshWebVersion: null }, fetcher)
    const group = createCodekinUpdateRoutes(checker)
    const writeHead = vi.fn(), end = vi.fn()
    const req = { method: 'GET', url: '/api/tracewild/updates?refresh=1', headers: { host: '127.0.0.1:8080', origin: 'https://foreign.invalid' } } as IncomingMessage
    await group.routes[0]!.handler(req, { writeHead, end } as unknown as ServerResponse)
    expect(writeHead.mock.calls[0]?.[0]).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
    group.close()
  })
})
