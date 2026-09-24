import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CodekinUpdateInfo } from '../packages/renderer-react/src/components/CodekinUpdateDialog.tsx'
import { parseUpdateReport } from '../packages/renderer-react/src/components/use-codekin-updates.ts'
import type { CodekinUpdateReport } from '../src/update-contract.ts'

const report: CodekinUpdateReport = { format: 'codekin-updates-v1', installedVersion: '0.3.9-rc.1', dshVersion: '0.1.7-rc.1', dshWebVersion: '0.4.1', supportedDsh: '>=0.1.7-rc.1 <0.1.8', compatible: true, status: 'ok', latestCompatibleVersion: '0.4.0-rc.1', updateAvailable: true, checkedAt: 1 }
describe('version notices', () => {
  it.each([true, false])('renders localized, version-pinned manual download guidance (zh=%s)', (zh: boolean) => {
    const html = renderToStaticMarkup(<CodekinUpdateInfo zh={zh} updates={{ report, busy: false, unavailable: false, refresh: vi.fn() }} />)
    expect(html).toContain('/v/0.4.0-rc.1')
    expect(html).toContain('@nath-vikky/dsh-codekin@0.4.0-rc.1')
    expect(html).toContain(zh ? '不会自动下载或安装' : 'nothing is downloaded or installed automatically')
    expect(html).not.toContain('npm install')
  })
  it('keeps startup failure and offline registry messages distinct from an incompatible version claim', () => {
    const html = renderToStaticMarkup(<CodekinUpdateInfo zh problem updates={{ report: { ...report, compatible: null, status: 'unavailable', latestCompatibleVersion: null, updateAvailable: false }, busy: false, unavailable: true, refresh: vi.fn() }} />)
    expect(html).toContain('暂时无法启动'); expect(html).toContain('暂时无法检查更新')
    expect(html).not.toContain('当前版本不兼容'); expect(html).not.toContain('当前版本无需更新')
  })
  it('does not instruct a compatible current build to reinstall an older release', () => {
    const updates = { report: { ...report, updateAvailable: false, latestCompatibleVersion: '0.3.8-rc.1' }, busy: false, unavailable: false, refresh: vi.fn() }
    const html = renderToStaticMarkup(<CodekinUpdateInfo zh updates={updates} />)
    expect(html).toContain('当前版本无需更新')
    expect(html).not.toContain('在 DSH 插件管理中选择此版本安装')
    const recovery = renderToStaticMarkup(<CodekinUpdateInfo zh updates={{ ...updates, report: { ...updates.report, compatible: false } }} />)
    expect(recovery).toContain('@nath-vikky/dsh-codekin@0.3.8-rc.1')
  })
  it('rejects incomplete or foreign response shapes', () => {
    expect(parseUpdateReport(report)).toEqual(report)
    for (const invalid of [{}, { ...report, checkedAt: -1 }, { ...report, status: 'latest' }, { ...report, dshVersion: 17 }]) expect(() => parseUpdateReport(invalid)).toThrow()
  })
})
