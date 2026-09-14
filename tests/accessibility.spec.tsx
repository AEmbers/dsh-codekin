import { renderToStaticMarkup } from 'react-dom/server'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { describe, expect, it } from 'vitest'
import { CORE_CODEKIN_RUNTIME, CORE_CONTENT_VIEW } from '../src/core-runtime.ts'
import {
  CodekinDetailModal,
  CodekinView,
} from '../packages/renderer-react/src/components/CodekinRosterView.tsx'
import { activateCodekinContent } from '../packages/renderer-react/src/content.ts'
import { zh } from '../packages/renderer-react/src/locales.ts'
import { CompanionLounge } from '../packages/renderer-react/src/components/CompanionLounge.tsx'

const t = ((key: keyof typeof zh, parameters?: Record<string, unknown>): string => {
  let value: string = zh[key]
  for (const [name, replacement] of Object.entries(parameters ?? {})) {
    value = value.replaceAll(`{${name}}`, String(replacement))
  }
  return value
}) as PropsLocale<'tracewild'>['t']

function buttonHasName(attributes: string, body: string): boolean {
  if (/\baria-label="[^"]+"/.test(attributes) || /\btitle="[^"]+"/.test(attributes)) return true
  return body.replace(/<[^>]+>/g, '').replaceAll('&times;', '×').trim().length > 0
}

function expectNamedButtons(markup: string): void {
  const buttons = [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
  expect(buttons.length).toBeGreaterThan(0)
  expect(buttons.filter(match => !buttonHasName(match[1] ?? '', match[2] ?? ''))).toEqual([])
}

describe('renderer accessibility semantics', () => {
  it('exposes the companion portrait, bond progress and locked stories without leaking unread story text', () => {
    activateCodekinContent(CORE_CONTENT_VIEW)
    const state = CORE_CODEKIN_RUNTIME.createInitialTraceWildState(1_000)
    const id = 'pet_companion_accessible_0001'
    state.creatures = [{ instanceId: id, creatureId: 'relay-mesh-jelly', quality: 'origin', level: 60, xp: 0, wins: 0, caughtAt: 1_000, firstSignal: 'relay' }]
    state.squad = [id]
    const render = () => renderToStaticMarkup(<CompanionLounge state={state} serverTime={1_000} t={t} zh busy={false} reducedMotion act={async () => undefined} />)
    const locked = render()
    expect(locked).toContain('aria-label="和群星水母说说话"')
    expect(locked).toContain('data-creature-appearance="ultimate"')
    expect(locked).toContain('data-motion="reduce"')
    expect(locked).toContain('data-paused="false"')
    expect(locked).toContain('<progress aria-label="羁绊" value="0" max="50"')
    expect([...locked.matchAll(/<button[^>]*disabled=""[^>]*data-story-chapter/g)]).toHaveLength(3)
    expect(locked).not.toContain('你第一次走进休息室时')
    expectNamedButtons(locked)
    state.lounge = { selectedInstanceId: id, bonds: { [id]: { points: 20, readStories: [0] } } }
    const unlocked = render()
    expect([...unlocked.matchAll(/<button[^>]*disabled=""[^>]*data-story-chapter/g)]).toHaveLength(1)
    expect(unlocked).toContain('已读')
    expect(unlocked).toContain('未读')
    expect(unlocked).not.toContain('你第一次走进休息室时')
  })

  it('labels roster controls and every interactive Codekin card', () => {
    activateCodekinContent(CORE_CONTENT_VIEW)
    let state = CORE_CODEKIN_RUNTIME.createInitialTraceWildState(1_000)
    state = CORE_CODEKIN_RUNTIME.applyTraceWildAction(
      state,
      { type: 'choose-starter', creatureId: 'lumen-indeximp' },
      () => 0,
      1_001,
    ).state
    const markup = renderToStaticMarkup(<CodekinView
      state={state}
      t={t}
      zh
      draft={[...state.squad]}
      setDraft={() => undefined}
      busy={false}
      save={async () => true}
      inspect={() => undefined}
    />)

    expect(markup).toContain('aria-controls="codekin-roster-controls"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-label="索引团 · 等级 1 · 智算 · 棱晶 · 出战 1 · 码灵详情"')
    expectNamedButtons(markup)
  })

  it('provides a labelled, keyboard-contained detail dialog with a named close control', () => {
    activateCodekinContent(CORE_CONTENT_VIEW)
    let state = CORE_CODEKIN_RUNTIME.createInitialTraceWildState(2_000)
    state = CORE_CODEKIN_RUNTIME.applyTraceWildAction(
      state,
      { type: 'choose-starter', creatureId: 'lumen-indeximp' },
      () => 0,
      2_001,
    ).state
    const captured = state.creatures[0]!
    const creature = CORE_CODEKIN_RUNTIME.content.creature(captured.creatureId)!
    const markup = renderToStaticMarkup(<CodekinDetailModal
      captured={captured}
      creature={creature}
      state={state}
      t={t}
      zh
      busy={false}
      act={async () => undefined}
      dismiss={() => undefined}
      release={() => undefined}
    />)

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('aria-labelledby="codekin-detail-title"')
    expect(markup).toContain('id="codekin-detail-title"')
    expect(markup).toContain('tabindex="-1"')
    expect(markup).toContain('data-dialog-initial-focus="true"')
    expect(markup).toContain('aria-label="关闭码灵详情"')
    expectNamedButtons(markup)
  })
})
