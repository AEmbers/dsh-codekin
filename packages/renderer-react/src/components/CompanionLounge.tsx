import { useEffect, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { TraceWildAction, TraceWildActionResponse, TraceWildState } from '../../../engine/src/types.ts'
import { COMPANION_BOND_LIMIT, COMPANION_INTERACTION_INTERVAL, COMPANION_STORY_THRESHOLDS,
  companionBond, companionInteractionReady, companionStoryUnlocked, selectedCompanion } from '../../../engine/src/companion.ts'
import { creatureById } from '../content.ts'
import { CreatureSprite, creatureName, ECOLOGY_KEYS } from './creature-presentation.tsx'
import { PanelDialog, PageControls, StoryPages, usePagination } from './PanelDialog.tsx'
import css, { styleText } from './companion-lounge.module.css'

export function CompanionLounge(props: {
  state: TraceWildState
  serverTime: number
  t: PropsLocale<'tracewild'>['t']
  zh: boolean
  busy: boolean
  reducedMotion: boolean
  act: (action: TraceWildAction) => Promise<TraceWildActionResponse | undefined>
}) {
  const { state, t, zh } = props
  const captured = selectedCompanion(state)
  const creature = captured === undefined ? undefined : creatureById(captured.creatureId)
  const [choosing, setChoosing] = useState(false)
  const [bondOpen, setBondOpen] = useState(false)
  const [query, setQuery] = useState('')
  const choices = state.creatures.filter(owned => {
    const definition = creatureById(owned.creatureId)
    return definition !== undefined && creatureName(definition, zh).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  })
  const paging = usePagination(choices, 6, query)
  const [line, setLine] = useState(-1)
  const [story, setStory] = useState<number>()
  const [gained, setGained] = useState(0)
  const [now, setNow] = useState(props.serverTime)
  const [hidden, setHidden] = useState(false)
  const selectButton = useRef<HTMLButtonElement>(null)
  const storyButtons = useRef<(HTMLButtonElement | null)[]>([])
  const pending = useRef(false)
  useEffect(() => {
    setLine(-1); setStory(undefined); setGained(0)
  }, [captured?.instanceId])
  useEffect(() => {
    const receivedAt = Date.now()
    const tick = () => { if (!document.hidden) setNow(props.serverTime + Math.max(0, Date.now() - receivedAt)) }
    const visibility = () => { setHidden(document.hidden); tick() }
    tick(); visibility()
    const timer = window.setInterval(tick, 15_000)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility) }
  }, [props.serverTime])
  if (captured === undefined || creature === undefined) return <p>{t('companionEmpty')}</p>
  const name = creatureName(creature, zh)
  const bond = companionBond(state, captured.instanceId)
  const ready = companionInteractionReady(bond, now)
  const profile = creature.companion
  const local = (text: { zhCN: string; en: string }) => zh ? text.zhCN : text.en
  const lines = profile?.lines.map(local) ?? [t('companionLine1'), t('companionLine2'), t('companionLine3')]
  const stories = profile?.stories.map(row => ({ title: local(row.title), body: local(row.body) })) ?? [
    { title: t('companionStory1Title'), body: t('companionStory1Body', { name }) },
    { title: t('companionStory2Title'), body: t('companionStory2Body', { name }) },
    { title: t('companionStory3Title'), body: t('companionStory3Body', { name }) },
  ]
  const dialogue = line < 0 ? profile === undefined ? t('companionGreeting') : local(profile.greeting) : lines[line % lines.length]!
  const closeChoice = () => { setChoosing(false); selectButton.current?.focus() }
  const closeStory = () => { setStory(undefined) }
  const talk = async () => {
    if (pending.current || props.busy) return
    setLine(previous => previous + 1); setGained(0)
    if (!ready) return
    pending.current = true
    try {
      const response = await props.act({ type: 'interact-companion', creatureInstanceId: captured.instanceId })
      if (response !== undefined) setGained(Math.max(0, companionBond(response.state, captured.instanceId).points - bond.points))
    } finally { pending.current = false }
  }
  const readStory = async (chapter: number) => {
    if (pending.current || props.busy || !companionStoryUnlocked(bond.points, chapter)) return
    if (bond.readStories.includes(chapter)) { setStory(chapter); return }
    pending.current = true
    try {
      if (await props.act({ type: 'read-companion-story', creatureInstanceId: captured.instanceId, chapter }) !== undefined) setStory(chapter)
    } finally { pending.current = false }
  }
  return <section className={css.lounge} aria-label={t('lounge')} data-paused={hidden} data-motion={props.reducedMotion ? 'reduce' : 'full'}>
    <style data-plugin-css="codekin-companion-lounge">{styleText}</style>
    <header className={css.heading}>
      <div><p>{t('companionKicker')}</p><h2>{t('companionTitle')}</h2></div>
      <button ref={selectButton} type="button" aria-expanded={choosing} aria-controls="codekin-companion-selection"
        onClick={() => setChoosing(value => !value)}>{t('companionChoose')}</button>
    </header>
    {choosing && <PanelDialog id="codekin-companion-selection" title={t('companionSelect')} closeLabel={t('companionCloseChoice')} onClose={closeChoice}>
      <p className={css.appearanceHint}>{t('companionHint')}</p>
      <input className={css.search} type="search" maxLength={80} value={query} aria-label={t('searchCodekin')}
        placeholder={t('searchCodekin')} onChange={event => setQuery(event.target.value)} />
      <div className={css.choices}>{paging.items.map(owned => {
        const definition = creatureById(owned.creatureId)
        if (definition === undefined) return null
        return <button key={owned.instanceId} type="button" aria-pressed={owned.instanceId === captured.instanceId}
          disabled={props.busy} data-companion-choice={owned.instanceId} onClick={async () => {
            if (await props.act({ type: 'set-companion', creatureInstanceId: owned.instanceId }) !== undefined) closeChoice()
          }}>
          <CreatureSprite creature={definition} captured={owned} size="small" />
          <span>{creatureName(definition, zh)}<small>Lv.{owned.level}</small></span>
        </button>
      })}</div>
      {choices.length === 0 && <p>{t('rosterNoMatches')}</p>}
      <PageControls {...paging} zh={zh} />
    </PanelDialog>}
    <div className={css.scene} data-ecology={creature.ecology}>
      <div className={css.identity}><span>{t(ECOLOGY_KEYS[creature.ecology])} · Lv.{captured.level}</span><h3>{name}</h3><small>{t('companionCurrent')}</small></div>
      <div className={css.orbit} aria-hidden="true" /><i className={css.starOne} aria-hidden="true">✦</i><i className={css.starTwo} aria-hidden="true">✧</i>
      <button type="button" className={css.portrait} onClick={() => { void talk() }} disabled={props.busy}
        aria-label={t('companionTalk', { name })} data-companion-talk data-companion-instance={captured.instanceId}>
        <span key={`${captured.instanceId}-${line}`} className={line < 0 ? css.arrive : css.respond}>
          <CreatureSprite creature={creature} captured={captured} size="large" priority="high" eager />
        </span>
        <small>{t('companionTap')}</small>
      </button>
    </div>
    <div className={css.dialogue} aria-live="polite" aria-atomic="true"><span aria-hidden="true">“</span><p>{dialogue}</p>
      {gained > 0 && <small key={line} className={css.gained}>{t('companionGained', { points: gained })}</small>}
    </div>
    <section key={captured.instanceId} className={css.bond} aria-label={t('companionBond')}>
      <header><button type="button" aria-haspopup="dialog" onClick={() => setBondOpen(true)}>♡ {t('companionBond')} <small>↗</small></button><span data-companion-points>{bond.points} <small>/ {COMPANION_BOND_LIMIT}</small></span></header>
      <progress aria-label={t('companionBond')} value={bond.points} max={COMPANION_BOND_LIMIT} />
    </section>
    <section className={css.stories} aria-label={t('companionStories')}>
      <h3>{t('companionStories')}</h3>
      <div>{stories.map((entry, chapter) => {
        const unlocked = companionStoryUnlocked(bond.points, chapter)
        return <button key={chapter} ref={node => { storyButtons.current[chapter] = node }} type="button" aria-haspopup="dialog"
          disabled={!unlocked || props.busy} aria-expanded={story === chapter} aria-controls="codekin-companion-story"
          data-story-chapter={chapter} onClick={() => { void readStory(chapter) }}>
          <span className={css.chapter}>{String(chapter + 1).padStart(2, '0')}</span><strong>{entry.title}</strong>
          <small>{unlocked ? t(bond.readStories.includes(chapter) ? 'companionStoryRead' : 'companionStoryNew')
            : t('companionStoryLocked', { points: COMPANION_STORY_THRESHOLDS[chapter]! })}</small>
        </button>
      })}</div>
    </section>
    {bondOpen && <PanelDialog title={t('companionBond')} closeLabel={t('companionCloseChoice')} onClose={() => setBondOpen(false)}>
      <div className={css.bondDetails}>      <div className={css.milestones}>{COMPANION_STORY_THRESHOLDS.map((points, index) => <span key={points}
        style={{ left: `${points / COMPANION_BOND_LIMIT * 100}%` }} data-unlocked={bond.points >= points}>{String(index + 1).padStart(2, '0')} · {points}</span>)}</div>
      <p className={css.availability}>{t(bond.points >= COMPANION_BOND_LIMIT ? 'companionMax' : ready ? 'companionReady' : 'companionCooldown', {
        minutes: Math.max(1, Math.ceil(((bond.lastInteractionAt ?? now) + COMPANION_INTERACTION_INTERVAL - now) / 60_000)),
      })}</p><small>{t('companionBondHint')}</small>
      </div>
    </PanelDialog>}
    {story !== undefined && companionStoryUnlocked(bond.points, story) && <PanelDialog id="codekin-companion-story"
      title={stories[story]!.title} closeLabel={t('companionStoryClose')} onClose={closeStory} restoreFocusTo={storyButtons.current[story]}>
      <StoryPages body={stories[story]!.body} zh={zh} />
    </PanelDialog>}
  </section>
}
