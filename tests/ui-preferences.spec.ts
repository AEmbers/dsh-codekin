import { afterEach, describe, expect, it, vi } from 'vitest'
import { readUiPreferences, saveUiPreferences } from '../packages/renderer-react/src/motion.ts'
import { codekinTranslator, en, zh } from '../packages/renderer-react/src/locales.ts'

afterEach(() => { vi.unstubAllGlobals() })

describe('plugin-local settings', () => {
  it('migrates existing motion/position preferences without guessing new choices', () => {
    let value = JSON.stringify({ reducedMotion: true, windowPosition: { x: 12, y: -8 } })
    vi.stubGlobal('localStorage', { getItem: () => value, setItem: (_key: string, next: string) => { value = next } })
    expect(readUiPreferences()).toEqual({ reducedMotion: true, windowPosition: { x: 12, y: -8 } })
    expect(saveUiPreferences({ language: 'en', startPage: 'dex', particles: false, encounterBadges: false, lockPosition: true })).toBe(true)
    expect(readUiPreferences()).toEqual({ reducedMotion: true, windowPosition: { x: 12, y: -8 }, language: 'en', startPage: 'dex', particles: false, encounterBadges: false, lockPosition: true })
    saveUiPreferences({ launcherPosition: { x: 30, y: 60 } })
    saveUiPreferences({ launcherPosition: undefined })
    expect(readUiPreferences().launcherPosition).toBeUndefined()
    expect(readUiPreferences().windowPosition).toEqual({ x: 12, y: -8 })
  })

  it('rejects invalid preference values and reports unavailable storage', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ language: 'ja', startPage: 'admin', particles: 'false', encounterBadges: 0, lockPosition: {} }) })
    expect(readUiPreferences()).toEqual({})
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('blocked') }, setItem: () => { throw Error('blocked') } })
    expect(readUiPreferences()).toEqual({})
    expect(saveUiPreferences({ language: 'zh' })).toBe(false)
  })

  it('switches plugin text and substitutions without changing the host translator', () => {
    const host = vi.fn((key: string) => `host:${key}`)
    expect(codekinTranslator(host, 'auto')).toBe(host)
    expect(codekinTranslator(host, 'en')('title')).toBe('Codekin')
    expect(codekinTranslator(host, 'zh')('title')).toBe('码灵')
    expect(codekinTranslator(host, 'en')('towerFloor', { floor: 12 })).toBe(en.towerFloor.replace('{floor}', '12'))
    expect(codekinTranslator(host, 'zh')('appearanceUnlockLevel', { level: '$&' })).toBe('Lv.$& 解锁')
    expect(codekinTranslator(host, 'zh')('appearanceUnlockLevel')).toBe(zh.appearanceUnlockLevel)
    expect(host).not.toHaveBeenCalled()
  })
})
