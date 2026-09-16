import { useState } from 'react'
import type { ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { CODEKIN_PAGES } from '../motion.ts'
import type { UiPreferences } from '../motion.ts'
import { PanelDialog } from './PanelDialog.tsx'
import css, { styleText } from './codekin-settings.module.css'

const REPOSITORY = 'https://github.com/Nath-Vikky/dsh-codekin'
const SECTIONS = ['preferencesInterface', 'preferencesEffects', 'preferencesHelp'] as const

function SettingRow(props: { label: string; hint: string; children: ReactNode }) {
  return <div className={css.row}><div><strong>{props.label}</strong><small>{props.hint}</small></div>{props.children}</div>
}

export function CodekinSettingsDialog(props: {
  t: PropsLocale<'tracewild'>['t']; preferences: UiPreferences; saved: boolean
  update: (value: UiPreferences) => void; close: () => void
  resetWindow: () => void; resetLauncher: () => void; refresh: () => Promise<void>
  enabled: boolean | undefined; online: boolean; busy: boolean; inBattle: boolean
  setEnabled: (enabled: boolean) => Promise<boolean>
}) {
  const { t, preferences: p } = props
  const [section, setSection] = useState<typeof SECTIONS[number]>('preferencesInterface')
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)
  const switchControl = (label: string, checked: boolean, change: () => void, disabled = false) =>
    <button type="button" role="switch" className={css.switch} aria-label={label} aria-checked={checked} disabled={disabled} onClick={change}>
      <i aria-hidden="true" /><span>{t(checked ? 'preferencesOn' : 'preferencesOff')}</span>
    </button>
  const toggleGameplay = async () => {
    if (pending || props.busy || props.enabled === undefined || !props.online || props.inBattle) return
    setPending(true); setFailed(false)
    try { setFailed(!await props.setEnabled(!props.enabled)) } catch { setFailed(true) } finally { setPending(false) }
  }
  return <PanelDialog id="codekin-settings" title={t('preferencesTitle')} closeLabel={t('closeSettings')} onClose={props.close}>
    <style data-plugin-css="codekin-settings">{styleText}</style>
    <div className={css.settings}>
      <nav className={css.sections} aria-label={t('preferencesSections')}>
        {SECTIONS.map(id => <button key={id} type="button" aria-pressed={section === id} aria-controls="codekin-settings-page" onClick={() => { setSection(id) }}>{t(id)}</button>)}
      </nav>
      <section id="codekin-settings-page" aria-label={t(section)} className={css.page}>
        {section === 'preferencesInterface' && <>
          <SettingRow label={t('preferencesLanguage')} hint={t('preferencesLanguageHint')}>
            <select aria-label={t('preferencesLanguage')} value={p.language ?? 'auto'} onChange={e => props.update({ language: e.target.value as UiPreferences['language'] & string })}>
              <option value="auto">{t('languageAuto')}</option><option value="zh" lang="zh-CN">简体中文</option><option value="en" lang="en">English</option>
            </select>
          </SettingRow>
          <SettingRow label={t('preferencesStartPage')} hint={t('preferencesStartPageHint')}>
            <select aria-label={t('preferencesStartPage')} value={p.startPage ?? 'lounge'} onChange={e => props.update({ startPage: e.target.value as UiPreferences['startPage'] & string })}>
              {CODEKIN_PAGES.map(id => <option key={id} value={id}>{t(id === 'tower' ? 'towerTitle' : id)}</option>)}<option value="last">{t('startPageLast')}</option>
            </select>
          </SettingRow>
          <SettingRow label={t('preferencesLock')} hint={t('preferencesLockHint')}>
            {switchControl(t('preferencesLock'), p.lockPosition === true, () => props.update({ lockPosition: !p.lockPosition }))}
          </SettingRow>
          <div className={css.actions} aria-label={t('preferencesPositions')}>
            <button type="button" onClick={props.resetWindow}>{t('resetWindow')}</button><button type="button" onClick={props.resetLauncher}>{t('resetLauncher')}</button>
          </div>
        </>}
        {section === 'preferencesEffects' && <>
          <SettingRow label={t('preferencesFullMotion')} hint={t('preferencesFullMotionHint')}>
            {switchControl(t('preferencesFullMotion'), p.reducedMotion !== true, () => props.update({ reducedMotion: !p.reducedMotion }))}
          </SettingRow>
          <SettingRow label={t('preferencesParticles')} hint={t('preferencesParticlesHint')}>
            {switchControl(t('preferencesParticles'), p.particles !== false, () => props.update({ particles: p.particles === false }), p.reducedMotion === true)}
          </SettingRow>
          <SettingRow label={t('preferencesBadges')} hint={t('preferencesBadgesHint')}>
            {switchControl(t('preferencesBadges'), p.encounterBadges !== false, () => props.update({ encounterBadges: p.encounterBadges === false }))}
          </SettingRow>
          <SettingRow label={t('preferencesHost')} hint={t(props.inBattle ? 'preferencesBattlePause' : 'preferencesHostHint')}>
            {switchControl(t('preferencesHost'), props.enabled === true, () => { void toggleGameplay() }, pending || props.busy || props.enabled === undefined || !props.online || props.inBattle)}
          </SettingRow>
          {failed && <p className={css.error} role="alert">{t('preferencesActionFailed')}</p>}
        </>}
        {section === 'preferencesHelp' && <>
          <div className={css.community}><strong>{t('preferencesGitHub')}</strong><p>{t('preferencesGitHubHint')}</p>
            <a href={REPOSITORY} target="_blank" rel="noopener noreferrer">{t('preferencesRepository')} ↗</a>
            <div className={css.links}><a href={`${REPOSITORY}/issues/new`} target="_blank" rel="noopener noreferrer">{t('preferencesIssue')} ↗</a>
              <a href={`${REPOSITORY}/issues`} target="_blank" rel="noopener noreferrer">{t('preferencesIssues')} ↗</a></div>
            <small>{t('preferencesIssueHint')}</small>
          </div>
          <div className={css.connection}><span>{t('preferencesConnection')} · {t(props.online ? 'preferencesConnected' : 'preferencesDisconnected')}</span>
            <button type="button" disabled={pending} onClick={() => { setPending(true); void props.refresh().finally(() => setPending(false)) }}>{t('retry')}</button></div>
          <small>{t('preferencesStorageHint')}</small>
        </>}
      </section>
      <footer className={css.footer}><small role="status">{t(props.saved ? 'preferencesSaved' : 'preferencesNotSaved')}</small>
        {section !== 'preferencesHelp' && <button type="button" onClick={() => props.update({ language: 'auto', startPage: 'lounge', lockPosition: false, reducedMotion: false, particles: true, encounterBadges: true })}>{t('preferencesDefaults')}</button>}
      </footer>
    </div>
  </PanelDialog>
}
