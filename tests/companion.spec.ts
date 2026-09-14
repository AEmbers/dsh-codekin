import { describe, expect, it, vi } from 'vitest'
import {
  COMPANION_INTERACTION_INTERVAL, applyTraceWildAction, companionBond, companionStoryUnlocked,
  createInitialTraceWildState, normalizeTraceWildAction, restoreTraceWildState, selectedCompanion,
} from '../src/core-runtime.ts'
import type { TraceWildState } from '../src/core-runtime.ts'

const jelly = 'pet_companion_jelly_0001'
const other = 'pet_companion_other_0002'
const missing = 'pet_companion_missing_0003'
const start = 1_000

function fixture(): TraceWildState {
  const state = createInitialTraceWildState(start)
  state.starterChosen = true
  state.creatures = [jelly, other].map((instanceId, index) => ({
    instanceId, creatureId: index === 0 ? 'relay-mesh-jelly' : 'lumen-indeximp',
    quality: 'prism', level: 1, xp: 0, wins: 0, caughtAt: start, firstSignal: index === 0 ? 'relay' : 'lumen',
  }))
  state.squad = [jelly]
  return state
}

describe('companion lounge progression', () => {
  it('selects an owned companion independently of the squad without consuming gameplay randomness', () => {
    const initial = fixture()
    const random = vi.fn(() => 0.5)
    const before = structuredClone(initial)
    const selected = applyTraceWildAction(initial, { type: 'set-companion', creatureInstanceId: other }, random, start + 1).state
    expect(selectedCompanion(selected)?.instanceId).toBe(other)
    expect(selected).toEqual({ ...before, revision: before.revision + 1, updatedAt: start + 1,
      lounge: { selectedInstanceId: other, bonds: {} } })
    expect(initial).toEqual(before)
    expect(random).not.toHaveBeenCalled()
    expect(applyTraceWildAction(selected, { type: 'set-companion', creatureInstanceId: other }, random, start + 2).state).toBe(selected)
    expect(() => applyTraceWildAction(selected, { type: 'set-companion', creatureInstanceId: missing }, random, start)).toThrow('invalid-action')
    expect(() => applyTraceWildAction(selected, { type: 'interact-companion', creatureInstanceId: jelly }, random, start)).toThrow('conflict')
  })

  it('awards five points at most once per ten minutes, independently for each companion, without settling idle rewards', () => {
    const random = vi.fn(() => 0)
    const before = fixture()
    const now = start + 3 * 60 * 60_000
    const talked = applyTraceWildAction(before, { type: 'interact-companion', creatureInstanceId: jelly }, random, now).state
    expect(talked.lounge).toEqual({ selectedInstanceId: jelly, bonds: { [jelly]: { points: 5, readStories: [], lastInteractionAt: now } } })
    expect(talked.idle).toEqual(before.idle)
    expect(talked.stats).toEqual(before.stats)
    expect(talked.creatures).toEqual(before.creatures)
    for (const at of [now - 1, now, now + COMPANION_INTERACTION_INTERVAL - 1]) {
      expect(applyTraceWildAction(talked, { type: 'interact-companion', creatureInstanceId: jelly }, random, at).state).toBe(talked)
    }
    let state = applyTraceWildAction(talked, { type: 'set-companion', creatureInstanceId: other }, random, now).state
    state = applyTraceWildAction(state, { type: 'interact-companion', creatureInstanceId: other }, random, now).state
    expect(companionBond(state, other).points).toBe(5)
    expect(companionBond(state, jelly).points).toBe(5)
    state = applyTraceWildAction(state, { type: 'set-companion', creatureInstanceId: jelly }, random, now).state
    state = applyTraceWildAction(state, { type: 'interact-companion', creatureInstanceId: jelly }, random, now + COMPANION_INTERACTION_INTERVAL).state
    expect(companionBond(state, jelly).points).toBe(10)
    expect(companionBond(state, other).points).toBe(5)
    expect(random).not.toHaveBeenCalled()
  })

  it('unlocks exactly three stories at 5, 20 and 50 points, persists reads, and caps progression', () => {
    const random = vi.fn(() => 0)
    let state = fixture()
    for (let visit = 0; visit < 10; visit++) {
      const points = visit * 5
      expect([0, 1, 2].map(chapter => companionStoryUnlocked(points, chapter)))
        .toEqual([points >= 5, points >= 20, points >= 50])
      for (const chapter of [0, 1, 2].filter(chapter => !companionStoryUnlocked(points, chapter))) {
        expect(() => applyTraceWildAction(state, { type: 'read-companion-story', creatureInstanceId: jelly, chapter }, random, start)).toThrow('invalid-action')
      }
      state = applyTraceWildAction(state, { type: 'interact-companion', creatureInstanceId: jelly }, random,
        start + visit * COMPANION_INTERACTION_INTERVAL).state
    }
    expect(companionBond(state, jelly).points).toBe(50)
    const now = start + 11 * COMPANION_INTERACTION_INTERVAL
    expect(applyTraceWildAction(state, { type: 'interact-companion', creatureInstanceId: jelly }, random, now).state).toBe(state)
    for (const chapter of [0, 1, 2]) state = applyTraceWildAction(state, { type: 'read-companion-story', creatureInstanceId: jelly, chapter }, random, now).state
    expect(companionBond(state, jelly).readStories).toEqual([0, 1, 2])
    expect(applyTraceWildAction(state, { type: 'read-companion-story', creatureInstanceId: jelly, chapter: 0 }, random, now).state).toBe(state)
    const restored = restoreTraceWildState(JSON.parse(JSON.stringify(state)), now)
    expect(restored.lounge).toEqual(state.lounge)
    expect(random).not.toHaveBeenCalled()
  })

  it('preserves legacy saves and bounds malformed or stale lounge entries on restore', () => {
    const before = fixture()
    expect(restoreTraceWildState(before, start).lounge).toBeUndefined()
    expect(selectedCompanion(before)?.instanceId).toBe(jelly)
    const restored = restoreTraceWildState({ ...before, lounge: {
      selectedInstanceId: missing, bonds: {
        [jelly]: { points: 999, lastInteractionAt: start + 100, readStories: [2, 2, 0, 99] },
        [other]: { points: Number.NaN, lastInteractionAt: -1, readStories: [0, 1, 2] },
        [missing]: { points: 50, readStories: [0, 1, 2] },
      },
    } }, start)
    expect(restored.lounge).toEqual({ bonds: {
      [jelly]: { points: 50, lastInteractionAt: start, readStories: [2, 0] },
      [other]: { points: 0, readStories: [] },
    } })
    expect(selectedCompanion(restored)?.instanceId).toBe(jelly)
    expect(restored.creatures).toEqual(before.creatures)
  })

  it('drops a released companion and her bond entry, retaining the remaining companion progress', () => {
    const state = fixture()
    state.lounge = { selectedInstanceId: jelly, bonds: {
      [jelly]: { points: 20, readStories: [0] }, [other]: { points: 5, readStories: [] },
    } }
    const released = applyTraceWildAction(state, { type: 'release-creature', creatureInstanceId: jelly }, () => 0.5, start + 1).state
    expect(released.lounge).toEqual({ bonds: { [other]: { points: 5, readStories: [] } } })
    expect(selectedCompanion(released)?.instanceId).toBe(other)
    expect(state.lounge.selectedInstanceId).toBe(jelly)
  })

  it('validates owned IDs and story indices at the protocol boundary without trusting client-supplied points or time', () => {
    for (const type of ['set-companion', 'interact-companion'] as const) {
      expect(normalizeTraceWildAction({ type, creatureInstanceId: jelly })).toEqual({ type, creatureInstanceId: jelly })
      for (const extra of [{ points: 50 }, { now: 999 }, { chapter: 0 }]) {
        expect(() => normalizeTraceWildAction({ type, creatureInstanceId: jelly, ...extra })).toThrow()
      }
    }
    for (const chapter of [0, 1, 2]) expect(normalizeTraceWildAction({ type: 'read-companion-story', creatureInstanceId: jelly, chapter }))
      .toEqual({ type: 'read-companion-story', creatureInstanceId: jelly, chapter })
    for (const chapter of [-1, 3, 0.5, '0', Number.NaN, undefined]) expect(() => normalizeTraceWildAction({ type: 'read-companion-story', creatureInstanceId: jelly, chapter })).toThrow()
    expect(() => normalizeTraceWildAction({ type: 'set-companion', creatureInstanceId: '__proto__' })).toThrow()
    expect(() => applyTraceWildAction({ ...fixture(), enabled: false }, { type: 'interact-companion', creatureInstanceId: jelly }, () => 0, start)).toThrow('conflict')
  })
})
