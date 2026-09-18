import { describe, expect, it } from 'vitest'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import { applyTraceSignal, applyTraceWildAction, createInitialTraceWildState, normalizeTraceWildAction, restoreTraceWildState } from '../src/core-runtime.ts'
import { EXPEDITION_BOSS, EXPEDITION_PERKS, expeditionRandom } from '../packages/engine/src/expedition.ts'
import { EXPEDITION_BOSS_IDS, EXPEDITION_SHOP_ITEMS } from '../packages/engine/src/expedition-catalog.ts'
import { areAdjacentTiles, createMatchBoard, findFirstLegalBattleSwap, resolveBattleSwap } from '../packages/engine/src/match3.ts'
import { TraceWildEventClassifier } from '../packages/dsh-adapter/src/classifier.ts'
import type { TraceWildAction, TraceWildState } from '../packages/engine/src/types.ts'

const random = () => 0.314159
const act = (state: TraceWildState, action: TraceWildAction) => applyTraceWildAction(state, action, random, state.updatedAt + 1).state
function fixture() {
  let state = act(createInitialTraceWildState(100), { type: 'choose-starter', creatureId: 'lumen-indeximp' })
  for (const [index, creatureId] of ['forge-sparkmite', 'aegis-veribud'].entries()) {
    state.creatures.push({ ...state.creatures[0]!, creatureId, instanceId: `pet_expedition_${index}` })
    state.squad.push(`pet_expedition_${index}`)
  }
  for (let index = 0; index < 6; index++) state = signal(state, true)
  return state
}
function signal(state: TraceWildState, collaboration = false) {
  const at = state.updatedAt + 10
  return applyTraceSignal(state, { id: at.toString(16).padStart(24, '0'), at, ecology: 'relay', outcome: 'completed', intensity: 1, enhanced: false, activeMinutes: 0, collaboration }, random)
}
function prepare(state = fixture()) {
  const started = act(state, { type: 'expedition-start', eventId: state.expedition!.events[0]!.id })
  return act(started, { type: 'expedition-continue', runId: started.expedition!.run!.id })
}
function win(state: TraceWildState) {
  // A lethal final-stage hit exercises the real authoritative settlement path.
  const next = structuredClone(state)
  next.battle!.turnOwner = 'player'
  next.battle!.actionsRemaining = 3
  next.battle!.activeIndex = next.battle!.party.length - 1
  next.battle!.pendingTeamDamage = next.battle!.wildMaxHp * 2
  next.battle!.expedition!.target = 'core'
  return act(next, { type: 'battle-skip-stage' })
}
function advance(state: TraceWildState) {
  for (let i = 0; i < 8 && !state.battle; i++) {
    const run = state.expedition!.run!
    if (run.phase === 'complete') break
    if (run.phase === 'upgrade') state = choosePerk(state)
    else if (run.phase === 'event') state = act(state, { type: 'expedition-node-choice', runId: run.id, node: run.stage, choice: run.stage === 1 ? 'cache-repair' : run.stage === 3 ? 'workshop-stock' : 'camp-repair' })
    else if (run.phase === 'route') state = act(state, { type: 'expedition-route', runId: run.id, route: 'safe-bridge' })
    else state = act(state, { type: 'expedition-continue', runId: run.id })
  }
  return state
}
function choosePerk(state: TraceWildState) { const run = state.expedition!.run!; return act(state, { type: 'expedition-perk', runId: run.id, perk: run.offers[0]! }) }
const workshop = () => choosePerk(win(advance(win(prepare()))))
const finalBattle = () => advance(win(advance(win(advance(win(prepare()))))))

describe('unknown expedition and permanent shop', () => {
  it('requires all six completed clues, including the first subagent collaboration', () => {
    let state = createInitialTraceWildState(100)
    for (let clue = 1; clue <= 6; clue++) {
      state = signal(state, true)
      expect(state.expedition!.events).toHaveLength(clue === 6 ? 1 : 0)
      expect(state.expedition!.clues).toBe(clue % 6)
    }
  })

  it('keeps identity absent through six nodes, fixes it at the endpoint, and never rerolls on retry', () => {
    let state = prepare()
    for (let battle = 0; battle < 3; battle++) {
      expect(state.expedition!.run!.bossId).toBeUndefined()
      state = win(state)
      expect(restoreTraceWildState(state, state.updatedAt).expedition!.run!.bossId).toBeUndefined()
      if (battle < 2) state = advance(state)
    }
    state = choosePerk(state)
    expect(state.expedition!.run).toMatchObject({ stage: 5, phase: 'event' })
    expect(state.expedition!.run!.bossId).toBeUndefined()
    const alternate = structuredClone(state)
    alternate.expedition!.run!.rng = 777
    const id = state.expedition!.run!.id
    state = act(state, { type: 'expedition-node-choice', runId: id, node: 5, choice: 'camp-repair' })
    const risk = act(alternate, { type: 'expedition-node-choice', runId: id, node: 5, choice: 'camp-sabotage' })
    const boss = state.expedition!.run!.bossId
    expect(EXPEDITION_BOSS_IDS).toContain(boss)
    expect(risk.expedition!.run!.bossId).toBe(boss)
    expect(state.expedition!.unlockedBosses).toEqual([])
    state = act(state, { type: 'expedition-continue', runId: id })
    expect(state.battle!.wildCreatureId).toBe(boss)
    state = act(state, { type: 'flee' })
    expect(state.expedition!.unlockedBosses).toEqual([])
    state = restoreTraceWildState(state, state.updatedAt)
    state = act(state, { type: 'expedition-retry', runId: id })
    expect(state.battle!.wildCreatureId).toBe(boss)
    state = win(state)
    expect(state.expedition!.unlockedBosses).toEqual([boss])
    state = act(state, { type: 'expedition-leave', runId: id })
    expect(restoreTraceWildState(state, state.updatedAt).expedition!.unlockedBosses).toEqual([boss])
  })

  it('covers all six endpoints and recruits only the individually cleared Boss, once', () => {
    const camp = choosePerk(win(advance(win(advance(win(prepare()))))))
    const selected = new Map<string, typeof camp>()
    for (let seed = 1; seed <= 100 && selected.size < 6; seed++) {
      const candidate = structuredClone(camp)
      candidate.expedition!.run!.event.seed = seed
      const ready = act(candidate, { type: 'expedition-node-choice', runId: candidate.expedition!.run!.id, node: 5, choice: 'camp-repair' })
      selected.set(ready.expedition!.run!.bossId!, ready)
    }
    expect([...selected.keys()].sort()).toEqual([...EXPEDITION_BOSS_IDS].sort())
    for (const [bossId, ready] of selected) {
      let state = act(ready, { type: 'expedition-continue', runId: ready.expedition!.run!.id })
      expect(state.battle!.wildCreatureId).toBe(bossId)
      state = win(state)
      state.expedition!.shards = 1000
      const id = state.expedition!.unlockedBosses[0]!
      const other = EXPEDITION_BOSS_IDS.find(other => other !== id)!
      expect(() => act(state, { type: 'expedition-recruit', bossId: other })).toThrow()
      const recruited = act(state, { type: 'expedition-recruit', bossId: id })
      expect(recruited.expedition!.shards).toBe(880)
      expect(recruited.creatures.at(-1)!.creatureId).toBe(id)
      const restored = restoreTraceWildState(recruited, recruited.updatedAt)
      expect(restored.expedition!.recruitedBosses).toEqual([id])
      expect(act(restored, { type: 'expedition-recruit', bossId: id }).expedition!.shards).toBe(880)
    }
  })

  it('migrates legacy Queen clears/recruitment and retains the Queen for an in-flight v2 run', () => {
    const legacy = JSON.parse(JSON.stringify(fixture()))
    Object.assign(legacy.expedition, { version: 1, clears: 1, recruited: true, shards: 80 })
    delete legacy.expedition.unlockedBosses; delete legacy.expedition.recruitedBosses; delete legacy.expedition.shopReceipts
    const migrated = restoreTraceWildState(legacy, legacy.updatedAt)
    expect(migrated.expedition).toMatchObject({ version: 2, shards: 80, unlockedBosses: [EXPEDITION_BOSS], recruitedBosses: [EXPEDITION_BOSS] })
    const oldRun = finalBattle()
    oldRun.expedition!.run!.version = 2
    delete oldRun.expedition!.run!.bossId
    const continued = restoreTraceWildState(oldRun, oldRun.updatedAt)
    expect(continued.expedition!.run!.bossId).toBe(EXPEDITION_BOSS)
    expect(continued.battle!.wildCreatureId).toBe(EXPEDITION_BOSS)
  })

  it('exchanges all XP tiers at authoritative prices and uses the existing upgrade inventory', () => {
    let state = fixture()
    state.expedition!.shards = 500
    for (const item of EXPEDITION_SHOP_ITEMS) {
      const before = state.materials[item.quality], balance = state.expedition!.shards
      const action = { type: 'expedition-shop-buy', itemId: item.id, count: 2, purchaseId: `shop_purchase_${item.id}` } as const
      expect(normalizeTraceWildAction(action)).toEqual(action)
      state = act(state, action)
      expect(state.materials[item.quality]).toBe(before + 2)
      expect(state.expedition!.shards).toBe(balance - 2 * item.cost)
      state = restoreTraceWildState(state, state.updatedAt)
      const replay = act(state, action)
      expect(replay.materials).toEqual(state.materials)
      expect(replay.expedition!.shards).toBe(state.expedition!.shards)
    }
    const xpBefore = state.creatures[0]!.xp, stock = state.materials.pulse
    state = act(state, { type: 'feed-material', creatureInstanceId: state.creatures[0]!.instanceId, quality: 'pulse', count: 1 })
    expect(state.materials.pulse).toBe(stock - 1)
    expect(state.creatures[0]!.xp).toBe(xpBefore + 100)
  })

  it('rejects invalid purchases, full inventory, insufficient shards and busy expeditions atomically', () => {
    const state = fixture()
    const buy = { type: 'expedition-shop-buy', itemId: 'xp-nova', count: 1, purchaseId: 'shop_invalid_test' } as const
    state.expedition!.shards = 21
    expect(() => act(state, buy)).toThrow()
    expect(state.expedition!.shards).toBe(21)
    state.expedition!.shards = 1000
    state.materials.nova = 9999
    expect(() => act(state, buy)).toThrow()
    expect(state.expedition!.shards).toBe(1000)
    for (const count of [-1, 0, 100, .5, NaN]) {
      expect(() => normalizeTraceWildAction({ ...buy, count })).toThrow()
      expect(() => act(state, { ...buy, count })).toThrow()
    }
    expect(() => normalizeTraceWildAction({ ...buy, price: 0 })).toThrow()
    expect(() => normalizeTraceWildAction({ ...buy, xp: 99999 })).toThrow()
    expect(() => normalizeTraceWildAction({ ...buy, itemId: 'unknown' })).toThrow()
    expect(() => act(prepare(), buy)).toThrow()
    expect(state.expedition!.shopReceipts).toEqual([])
  })

  it('runs distinct interference modules and disables them after destruction', () => {
    const base = finalBattle()
    function tick(bossId: typeof EXPEDITION_BOSS_IDS[number], broken = false, overdrive = false) {
      const state = structuredClone(base), battle = state.battle!
      battle.wildCreatureId = bossId; state.expedition!.run!.bossId = bossId
      battle.turnOwner = 'boss'; battle.actionsRemaining = 0; battle.pendingBossDamage = 0
      battle.bossActionsRemaining = 1; battle.bossActionsTaken = 100; battle.wildAttack = 0
      battle.bossSkillArmed = false; battle.enemyBurn = 0; battle.enemyMarks = 2
      battle.partyShield = 1000; battle.expedition!.perks = []
      battle.expedition!.lastEcology = 'forge'; battle.expedition!.overdrive = overdrive
      if (broken) battle.expedition!.interferenceHp = 0
      for (const member of battle.party) member.energy = 6
      return act(state, { type: 'battle-continue' }).battle!
    }
    const hazards = (bossId: typeof EXPEDITION_BOSS_IDS[number]) => tick(bossId).board.filter(tile => tile.hazardActions).length
    expect(hazards('forge-dragon-empress')).toBeGreaterThan(hazards('relay-fork-queen'))
    expect(tick('lumen-mirror-dreamer').expedition!.mirror).toBe('forge')
    expect(tick('lumen-mirror-dreamer', true).expedition!.mirror).toBeUndefined()
    expect(tick('aegis-chain-warden').board.some(tile => tile.lockedActions)).toBe(true)
    expect(tick('aegis-chain-warden', true).board.some(tile => tile.lockedActions)).toBe(false)
    expect(tick('glitch-zero-hour').party.map(member => member.energy)).toEqual([5, 5, 5])
    expect(tick('glitch-zero-hour', false, true).party.map(member => member.energy)).toEqual([4, 4, 4])
    expect(tick('glitch-reset-cantor').partyShield).toBe(500)
    expect(tick('glitch-reset-cantor', false, true).partyShield).toBe(0)
    expect(tick('glitch-reset-cantor').enemyMarks).toBe(0)
    expect(tick('glitch-reset-cantor', true).partyShield).toBe(1000)
  })
})

describe('event expeditions', () => {
  it('discovers through real child completion, ignores tool-name guesses, duplicate and late child events', () => {
    const classifier = new TraceWildEventClassifier()
    const root = Session.create(SessionId('expedition-root'))
    const child = Session.create(SessionId('expedition-child'), [], { ...root.header, id: SessionId('expedition-child'), parentSession: root.id, origin: 'subagent' })
    classifier.observe(root, root.append('turn/start', { turn: 1 }))
    classifier.observe(root, root.append('tool/call', { turn: 1, step: 1, callId: 'agent-call' as never, name: 'spawn_agent', arguments: '{}' }))
    const guessed = classifier.observe(root, root.append('turn/end', { turn: 1, reason: { kind: 'completed' } }))!
    expect(guessed.collaboration).toBe(false)
    classifier.observe(root, root.append('turn/start', { turn: 2 }))
    const done = child.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    classifier.observeRelatedActivity(root, done, child)
    classifier.observeRelatedActivity(root, done, child)
    const signal = classifier.observe(root, root.append('turn/end', { turn: 2, reason: { kind: 'completed' } }))!
    expect(signal.collaboration).toBe(true)
    classifier.observeRelatedActivity(root, done, child)
    classifier.observe(root, root.append('turn/start', { turn: 3 }))
    classifier.observeRelatedActivity(root, done, child)
    expect(classifier.observe(root, root.append('turn/end', { turn: 3, reason: { kind: 'completed' } }))!.collaboration).toBe(false)
  })

  it('caps the discovery queue, protects the watermark across replay and rollback, and supports ordinary turns', () => {
    let state = fixture()
    expect(state.expedition!.events).toHaveLength(1)
    expect(state.expedition!.events[0]).toMatchObject({ source: 'collaboration', tutorial: true })
    for (let i = 0; i < 35; i++) state = signal(state)
    expect(state.expedition!.events).toHaveLength(3)
    expect(state.expedition!.clues).toBeLessThanOrEqual(18)
    const before = structuredClone(state.expedition)
    const replay = { id: 'a'.repeat(24), at: 1, ecology: 'relay' as const, outcome: 'completed' as const, intensity: 1, activeMinutes: 0, enhanced: false, collaboration: true }
    state = applyTraceSignal(state, replay, random)
    expect(state.expedition).toEqual(before)
    let ordinary = createInitialTraceWildState(100)
    for (let i = 0; i < 6; i++) ordinary = signal(ordinary)
    expect(ordinary.expedition!.events[0]).toMatchObject({ tutorial: true, source: 'activity' })
  })

  it('banks each stage once, freezes a choice per family, carries health/charge and grants first-clear once', () => {
    let state = prepare()
    const id = state.expedition!.run!.id
    state.battle!.partyHp -= 100
    state.battle!.party[0]!.energy = 7
    state = win(state)
    expect(state.expedition!.shards).toBe(4)
    expect(state.expedition!.run!.party[0]!.energy).toBe(7)
    expect(state.expedition!.run!.hp).toBeLessThan(state.expedition!.run!.maxHp)
    expect(new Set(state.expedition!.run!.offers.map(id => EXPEDITION_PERKS.find(perk => perk.id === id)!.family)).size).toBe(3)
    expect(() => act(state, { type: 'battle-skip-stage' })).toThrow()
    const restored = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt + 1)
    expect(restored.expedition!.run!.offers).toEqual(state.expedition!.run!.offers)
    state = advance(restored)
    expect(state.battle!.party[0]!.energy).toBeGreaterThanOrEqual(7)
    expect(state.battle!.expedition!.stage).toBe(2)
    state = advance(win(state))
    expect(state.battle!.expedition!.stage).toBe(4)
    state = advance(win(state))
    expect(state.battle!.expedition!.shieldHp).toBeGreaterThan(0)
    state = win(state)
    expect(state.expedition).toMatchObject({ shards: 54, clears: 1, run: { phase: 'complete', rewards: [0, 2, 4, 6], completed: [0, 1, 2, 3, 4, 5, 6], materials: 5 } })
    expect(() => act(state, { type: 'expedition-continue', runId: id })).toThrow()
    state = act(state, { type: 'expedition-leave', runId: id })
    for (let i = 0; i < 6; i++) state = signal(state)
    state = win(advance(win(advance(win(advance(win(prepare(state))))))))
    expect(state.expedition!.shards).toBe(84)
    expect(state.expedition!.clears).toBe(2)
  })

  it('restores an in-flight battle and retries the exact entry snapshot, without rerolling or charging cores', () => {
    let state = prepare()
    const run = state.expedition!.run!
    const checkpoint = structuredClone(state.battle!)
    const cores = structuredClone(state.cores)
    const swap = findFirstLegalBattleSwap(state.battle!.board)!
    state = act(state, { type: 'battle-swap', ...swap })
    const restored = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt + 1)
    expect(restored.battle?.board).toEqual(state.battle!.board)
    expect(restored.battle?.partyHp).toBe(state.battle!.partyHp)
    expect(restored.battle?.expedition).toEqual(state.battle!.expedition)
    expect(restored.expedition!.run!.rng).toBe(state.expedition!.run!.rng)
    state = act(restored, { type: 'flee' })
    state = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt + 1)
    state = act(state, { type: 'expedition-retry', runId: run.id })
    expect(state.battle?.board).toEqual(checkpoint.board)
    expect(state.battle?.partyHp).toBe(checkpoint.partyHp)
    expect(state.expedition!.run!.rng).toBe(run.checkpointRng)
    expect(state.cores).toEqual(cores)
    expect(state.expedition!.shards).toBe(0)
  })

  it('enforces exploration exclusivity, rejects stale choices and client-supplied reward amounts', () => {
    const state = prepare()
    for (const action of [{ type: 'start-tower' }, { type: 'start-battle', encounterId: state.encounters[0]!.id }, { type: 'capture', quality: 'origin' }, { type: 'set-squad', instanceIds: state.squad }, { type: 'feed-material', creatureInstanceId: state.squad[0]!, quality: 'pebble', count: 1 }, { type: 'expedition-leave', runId: 'run_wrong_12345678' }] as TraceWildAction[]) {
      expect(() => act(state, action), action.type).toThrow()
    }
    expect(() => normalizeTraceWildAction({ type: 'expedition-recruit', shards: 0 })).toThrow()
    expect(() => normalizeTraceWildAction({ type: 'expedition-perk', runId: state.expedition!.run!.id, perk: 'infinite-charge' })).toThrow()
    const upgraded = win(state)
    const choice = { type: 'expedition-perk' as const, runId: upgraded.expedition!.run!.id, perk: upgraded.expedition!.run!.offers[0]! }
    expect(() => act(act(upgraded, choice), choice)).toThrow()
  })

  it('recruits atomically once, requires a clear and space, and preserves shards on failure', () => {
    const state = fixture()
    state.expedition!.shards = 120
    expect(() => act(state, { type: 'expedition-recruit' })).toThrow()
    state.expedition!.clears = 1
    state.expedition!.unlockedBosses = [EXPEDITION_BOSS]
    const full = structuredClone(state)
    full.creatures = Array.from({ length: 240 }, (_, index) => ({ ...full.creatures[0]!, instanceId: `pet_capacity_${index}` }))
    expect(() => act(full, { type: 'expedition-recruit' })).toThrow()
    expect(full.expedition!.shards).toBe(120)
    const recruited = act(state, { type: 'expedition-recruit' })
    expect(recruited.expedition!.shards).toBe(0)
    expect(recruited.creatures.filter(creature => creature.creatureId === EXPEDITION_BOSS)).toHaveLength(1)
    expect(act(recruited, { type: 'expedition-recruit' }).creatures).toEqual(recruited.creatures)
    const queen = recruited.creatures.find(creature => creature.creatureId === EXPEDITION_BOSS)!
    expect(() => act(recruited, { type: 'release-creature', creatureInstanceId: queen.instanceId })).toThrow()
    queen.level = 60
    expect(() => act(recruited, { type: 'set-creature-appearance', creatureInstanceId: queen.instanceId, appearance: 'evolved' })).toThrow()
    expect(() => act(recruited, { type: 'set-creature-appearance', creatureInstanceId: queen.instanceId, appearance: 'ultimate' })).toThrow()
  })

  it('preserves banked rewards when content becomes incompatible and tolerates older saves', () => {
    const state = win(prepare())
    state.expedition!.run!.content = 'missing-pack@99'
    const restored = restoreTraceWildState(state, state.updatedAt)
    expect(restored.expedition).toMatchObject({ shards: 4, recoveryNotice: true })
    expect(restored.expedition!.run).toBeUndefined()
    const old = fixture()
    delete old.expedition
    expect(restoreTraceWildState(old, old.updatedAt).creatures).toHaveLength(3)
  })

  it('lets modules absorb damage and stay disabled after a restart', () => {
    let state = finalBattle()
    const id = state.expedition!.run!.id
    state = act(state, { type: 'expedition-target', runId: id, target: 'shield' })
    const hp = state.battle!.wildHp
    state.battle!.activeIndex = state.battle!.party.length - 1
    state.battle!.pendingTeamDamage = state.battle!.expedition!.shieldHp
    state = act(state, { type: 'battle-skip-stage' })
    expect(state.battle!.wildHp).toBe(hp)
    expect(state.battle!.expedition!.shieldHp).toBe(0)
    state = restoreTraceWildState(state, state.updatedAt)
    expect(state.battle!.expedition!.shieldHp).toBe(0)
  })

  it('bounds perk charge loops, applies entry protection and banks post-battle cooling', () => {
    let state = fixture()
    state = act(state, { type: 'expedition-start', eventId: state.expedition!.events[0]!.id })
    state.expedition!.run!.perks = EXPEDITION_PERKS.map(perk => perk.id)
    state = act(state, { type: 'expedition-continue', runId: state.expedition!.run!.id })
    expect(state.battle!.partyShield).toBe(Math.round(state.battle!.partyMaxHp * 0.12))
    state.battle!.party[0]!.energy = 12
    state = act(state, { type: 'battle-cast', creatureInstanceId: state.squad[0]! })
    expect(state.battle!.expedition!.relayUsed).toEqual([state.squad[0]])
    expect(state.battle!.party[1]!.energy).toBeGreaterThanOrEqual(2)
    for (let turn = 0; turn < 80 && state.battle; turn++) {
      if (state.battle.turnOwner === 'boss' || state.battle.actionsRemaining === 0) state = act(state, { type: 'battle-continue' })
      else {
        const swap = findFirstLegalBattleSwap(state.battle.board)
        state = act(state, swap ? { type: 'battle-swap', ...swap } : { type: 'battle-skip-stage' })
      }
      if (!state.battle) break
      expect(state.battle.party.every(member => member.energy >= 0 && member.energy <= 12)).toBe(true)
      expect(state.battle.expedition!.overflowUsed.length).toBeLessThanOrEqual(3)
      expect(state.battle.enemyMarks).toBeLessThanOrEqual(3)
      expect(state.battle.partyShield).toBeLessThanOrEqual(Math.round(state.battle.partyMaxHp * 0.6))
    }
    const cooling = prepare()
    cooling.expedition!.run!.perks = ['cooling']
    cooling.battle!.partyHp = Math.round(cooling.battle!.partyMaxHp * 0.5)
    const health = cooling.battle!.partyHp
    const cleared = win(cooling)
    expect(cleared.expedition!.run!.hp).toBe(health + Math.round(cooling.battle!.partyMaxHp * 0.15))
  })

  it('replays the same next swap after restore, including mirrored resistance and perk counters', () => {
    let state = advance(win(advance(win(prepare()))))
    const combat = state.battle!.expedition!
    combat.perks = ['four-beacon', 'backflow', 'star-trace']
    state.expedition!.run!.perks = [...combat.perks]
    combat.mirror = 'forge'
    state.battle!.party.forEach(member => { member.energy = 10 })
    const restored = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt)
    const swap = findFirstLegalBattleSwap(state.battle!.board)!
    const first = act(state, { type: 'battle-swap', ...swap })
    const second = act(restored, { type: 'battle-swap', ...swap })
    expect(second.battle?.board).toEqual(first.battle?.board)
    expect(second.battle?.pendingTeamDamage).toEqual(first.battle?.pendingTeamDamage)
    expect(second.battle?.party.map(member => member.energy)).toEqual(first.battle?.party.map(member => member.energy))
    expect(second.battle?.expedition).toEqual(first.battle?.expedition)
  })

  it('makes supply decisions once, charges real runtime and rejects lethal or stale choices', () => {
    const state = choosePerk(win(prepare()))
    const run = state.expedition!.run!, cost = Math.ceil(run.maxHp * .12)
    expect(run).toMatchObject({ stage: 1, phase: 'event', completed: [0] })
    const action = { type: 'expedition-node-choice', runId: run.id, node: 1, choice: 'cache-salvage' } as const
    const poor = structuredClone(state)
    poor.expedition!.run!.hp = cost
    expect(() => act(poor, action)).toThrow()
    expect(poor.expedition!.shards).toBe(4)
    const next = act(state, action)
    expect(next.expedition).toMatchObject({ shards: 10, run: { stage: 2, phase: 'route', hp: run.hp - cost, supplies: { shuffle: 2 }, completed: [0, 1] } })
    expect(() => act(next, action)).toThrow()
    expect(() => act(state, { ...action, node: 3 })).toThrow()
    expect(() => normalizeTraceWildAction({ ...action, shards: 999 })).toThrow()
    const charged = act(state, { ...action, choice: 'cache-charge' })
    expect(charged.expedition!.run!.party.map(member => member.energy)).toEqual(run.party.map(member => Math.min(12, member.energy + 2)))
    expect(charged.expedition!.run!.supplies.burst).toBe(1)
  })

  it('locks forge offers across reload and replaces a chosen perk only on confirmation', () => {
    let state = workshop()
    const original = structuredClone(state.expedition!.run!)
    expect(original).toMatchObject({ stage: 3, phase: 'event' })
    const replace = original.perks[0]!
    state = act(state, { type: 'expedition-node-choice', runId: original.id, node: 3, choice: 'workshop-reforge', replace })
    expect(state.expedition!.run!.perks).toContain(replace)
    expect(state.expedition!.run!.hp).toBe(original.hp)
    const offers = state.expedition!.run!.offers
    state = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt)
    expect(state.expedition!.run!.offers).toEqual(offers)
    expect(state.expedition!.run!.replacePerk).toBe(replace)
    state = choosePerk(state)
    expect(state.expedition!.run).toMatchObject({ stage: 4, phase: 'ready' })
    expect(state.expedition!.run!.perks).not.toContain(replace)
    expect(state.expedition!.run!.perks).toHaveLength(original.perks.length)
    expect(state.expedition!.run!.perks).toContain(offers[0])
    const installed = act(workshop(), { type: 'expedition-node-choice', runId: original.id, node: 3, choice: 'workshop-install' })
    expect(installed.expedition!.run!.hp).toBe(original.hp - Math.ceil(original.maxHp * .15))
    expect(choosePerk(installed).expedition!.run!.perks).toHaveLength(original.perks.length + 1)
  })

  it('makes the elite bridge stronger with hazards, and banks its bonus once', () => {
    const supply = choosePerk(win(prepare())), id = supply.expedition!.run!.id
    const crossing = act(supply, { type: 'expedition-node-choice', runId: id, node: 1, choice: 'cache-charge' })
    const enter = (route: 'safe-bridge' | 'unstable-bridge') => act(act(crossing, { type: 'expedition-route', runId: id, route }), { type: 'expedition-continue', runId: id })
    const safe = enter('safe-bridge'), elite = enter('unstable-bridge')
    expect(elite.battle!.wildMaxHp / safe.battle!.wildMaxHp).toBeCloseTo(1.2, 2)
    expect(elite.battle!.wildAttack / safe.battle!.wildAttack).toBeCloseTo(1.2, 1)
    expect(elite.battle!.board.some(tile => tile.hazardActions)).toBe(true)
    expect(elite.battle!.board[27]!.special).toBe('burst')
    expect(safe.battle!.partyShield).toBeGreaterThanOrEqual(Math.round(safe.battle!.partyMaxHp * .1))
    expect(win(elite).expedition!.shards - win(safe).expedition!.shards).toBe(6)
  })

  it('consumes one support without a swap, preserves shuffle hazards and restores stock on retry', () => {
    let state = prepare()
    const id = state.expedition!.run!.id, checkpoint = structuredClone(state.battle!.board)
    state.battle!.board[5]!.lockedActions = 2
    state.battle!.board[9]!.hazardActions = 3
    state.battle!.board[20]!.special = 'burst'
    const before = state.battle!.actionsRemaining
    const restored = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt)
    const action = { type: 'expedition-support', runId: id, support: 'shuffle' } as const
    const replay = act(restored, action)
    state = act(state, action)
    expect(state.battle!.board).toEqual(replay.battle!.board)
    expect(state.battle!.board[5]!.lockedActions).toBe(2)
    expect(state.battle!.board[9]!.hazardActions).toBe(3)
    expect(state.battle!.board.filter(tile => tile.special === 'burst')).toHaveLength(1)
    expect(state.battle!.actionsRemaining).toBe(before)
    expect(state.expedition!.run!.supplies.shuffle).toBe(0)
    expect(() => act(state, action)).toThrow()
    state = act(state, { type: 'flee' })
    state = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt)
    state = act(state, { type: 'expedition-retry', runId: id })
    expect(state.expedition!.run!.supplies.shuffle).toBe(1)
    expect(state.battle!.board).toEqual(checkpoint)
    expect(state.battle!.expedition!.supportUsed).toBe(false)
    expect(() => normalizeTraceWildAction({ ...action, count: 99 })).toThrow()
  })

  it('cleanses and heals immediately, plants a burst in place, and disallows support during enemy turns', () => {
    const state = prepare(), id = state.expedition!.run!.id
    state.expedition!.run!.supplies = { shuffle: 1, cleanse: 1, burst: 1 }
    state.battle!.partyHp = Math.round(state.battle!.partyMaxHp * .5)
    state.battle!.board[0]!.hazardActions = 2
    state.battle!.board[2]!.lockedActions = 3
    const clean = act(state, { type: 'expedition-support', runId: id, support: 'cleanse' })
    expect(clean.battle!.partyHp).toBe(state.battle!.partyHp + Math.round(state.battle!.partyMaxHp * .06))
    expect(clean.battle!.board.some(tile => tile.lockedActions || tile.hazardActions)).toBe(false)
    const burst = act(state, { type: 'expedition-support', runId: id, support: 'burst' })
    expect(burst.battle!.board[27]).toMatchObject({ ecology: state.battle!.board[27]!.ecology, special: 'burst' })
    expect(burst.battle!.board[0]!.hazardActions).toBe(2)
    expect(() => act(burst, { type: 'expedition-support', runId: id, support: 'cleanse' })).toThrow()
    state.battle!.turnOwner = 'boss'
    expect(() => act(state, { type: 'expedition-support', runId: id, support: 'cleanse' })).toThrow()
  })

  it('enters phase II once, persists it, and keeps broken modules disabled', () => {
    let state = finalBattle()
    const attack = state.battle!.wildAttack
    state.battle!.expedition!.shieldHp = 0
    state.battle!.expedition!.interferenceHp = 0
    state.battle!.wildHp = Math.floor(state.battle!.wildMaxHp * .5) + 1
    state.battle!.wildShield = 0
    state.battle!.activeIndex = state.battle!.party.length - 1
    state.battle!.pendingTeamDamage = 1
    state = act(state, { type: 'battle-skip-stage' })
    expect(state.battle).toMatchObject({ enemyPhase: 2, wildAttack: Math.round(attack * 1.2), expedition: { overdrive: true, shieldHp: 0, interferenceHp: 0 } })
    state = restoreTraceWildState(JSON.parse(JSON.stringify(state)), state.updatedAt)
    expect(state.battle!.expedition!.overdrive).toBe(true)
    state.battle!.turnOwner = 'player'
    state.battle!.actionsRemaining = 3
    state.battle!.activeIndex = state.battle!.party.length - 1
    state.battle!.pendingTeamDamage = 1
    state = act(state, { type: 'battle-skip-stage' })
    expect(state.battle!.wildAttack).toBe(Math.round(attack * 1.2))
    expect(win(state).expedition!.shards).toBe(58)
  })

  it('trades weaker final modules for more attack and a clear bonus at the final camp', () => {
    const camp = choosePerk(win(advance(win(advance(win(prepare()))))))
    expect(camp.expedition!.run!.stage).toBe(5)
    const id = camp.expedition!.run!.id
    const sabotaged = act(act(camp, { type: 'expedition-node-choice', runId: id, node: 5, choice: 'camp-sabotage' }), { type: 'expedition-continue', runId: id })
    const safe = finalBattle()
    expect(sabotaged.battle!.expedition!.moduleMaxHp / safe.battle!.expedition!.moduleMaxHp).toBeCloseTo(.75, 2)
    expect(sabotaged.battle!.wildAttack / safe.battle!.wildAttack).toBeCloseTo(1.15, 1)
    expect(win(sabotaged).expedition!.shards).toBe(58)
  })

  it('refunds an unfinished legacy run once and rejects impossible phase/node saves safely', () => {
    const legacy = JSON.parse(JSON.stringify(win(prepare())))
    legacy.expedition.run.version = 1
    const migrated = restoreTraceWildState(legacy, legacy.updatedAt)
    expect(migrated.expedition).toMatchObject({ shards: 4, recoveryNotice: true })
    expect(migrated.expedition!.run).toBeUndefined()
    expect(migrated.expedition!.events).toHaveLength(1)
    expect(restoreTraceWildState(migrated, migrated.updatedAt).expedition!.events).toHaveLength(1)
    for (const [stage, phase] of [[1, 'battle'], [0, 'event'], [4, 'route'], [5, 'complete']]) {
      const broken = JSON.parse(JSON.stringify(prepare()))
      Object.assign(broken.expedition.run, { stage, phase })
      const recovered = restoreTraceWildState(broken, broken.updatedAt)
      expect(recovered.expedition!.run).toBeUndefined()
      expect(recovered.battle).toBeUndefined()
    }
    const noStock = JSON.parse(JSON.stringify(prepare()))
    delete noStock.expedition.run.checkpointSupplies
    expect(restoreTraceWildState(noStock, noStock.updatedAt).expedition!.run).toBeUndefined()
  })

  it('quick-boot charges on entry and emergency reserve heals only once', () => {
    let state = prepare()
    state.expedition!.run!.perks = ['last-reserve']
    state.battle!.expedition!.perks = ['last-reserve']
    state.battle!.partyHp = Math.round(state.battle!.partyMaxHp * .2)
    const before = state.battle!.partyHp
    const swap = findFirstLegalBattleSwap(state.battle!.board)!
    state = act(state, { type: 'battle-swap', ...swap })
    expect(state.battle!.partyHp).toBe(before + Math.round(state.battle!.partyMaxHp * .12))
    expect(state.battle!.expedition!.emergencyUsed).toBe(true)
    state.battle!.partyHp = before
    const again = findFirstLegalBattleSwap(state.battle!.board)!
    state = act(state, { type: 'battle-swap', ...again })
    expect(state.battle!.partyHp).toBe(before)
    const entry = fixture()
    const start = act(entry, { type: 'expedition-start', eventId: entry.expedition!.events[0]!.id })
    start.expedition!.run!.perks = ['quick-boot']
    const booted = act(start, { type: 'expedition-continue', runId: start.expedition!.run!.id })
    expect(booted.battle!.party.every(member => member.energy === 3)).toBe(true)
    expect(booted.battle!.wildCreatureId).toBe('relay-forktail')
  })

  it('turns direct matches into additional damage, healing and shared charge, with matching animation totals', () => {
    const state = prepare(), run = state.expedition!.run!
    state.battle!.partyHp = Math.round(state.battle!.partyMaxHp * .5)
    state.battle!.wildArmor = 0
    let seed = 53913
    const seeded = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
    let found: { from: number; to: number } | undefined
    for (let attempt = 0; attempt < 100 && !found; attempt++) {
      state.battle!.board = createMatchBoard(seeded)
      for (let from = 0; from < 64 && !found; from++) for (const to of [from + 1, from + 8]) {
        if (!areAdjacentTiles(from, to)) continue
        const resolution = resolveBattleSwap(state.battle!.board, from, to, expeditionRandom(structuredClone(run)))
        const colors = new Set(resolution?.steps.flatMap(step => Object.entries(step.counts).filter(([, count]) => count > 0).map(([color]) => color)))
        if ((resolution?.steps[0]?.maxGroup ?? 0) >= 5 && colors.size >= 3) { found = { from, to }; break }
      }
    }
    expect(found).toBeDefined()
    const action = { type: 'battle-swap', ...found! } as const
    const baseline = act(state, action).battle!
    for (const perk of ['steady-flow', 'prism-pulse', 'shared-current'] as const) {
      const upgraded = structuredClone(state)
      upgraded.battle!.expedition!.perks = [perk]
      upgraded.expedition!.run!.perks = [perk]
      const result = applyTraceWildAction(upgraded, action, random, state.updatedAt + 1), battle = result.state.battle!
      if (perk === 'steady-flow') expect(battle.pendingPartyHealing - baseline.pendingPartyHealing).toBe(Math.round(battle.partyMaxHp * .02))
      if (perk === 'shared-current') expect(battle.party.map(member => member.energy)).toEqual(baseline.party.map(member => Math.min(12, member.energy + 1)))
      if (perk === 'prism-pulse') {
        expect(battle.pendingTeamDamage).toBeGreaterThan(baseline.pendingTeamDamage)
        expect(result.animation!.frames.at(-1)!.totalDamage).toBe(battle.pendingTeamDamage)
      }
    }
    state.battle!.wildShield = 100
    const shielded = act(state, action).battle!
    state.battle!.expedition!.perks = ['module-piercer']
    state.expedition!.run!.perks = ['module-piercer']
    expect(act(state, action).battle!.pendingTeamDamage).toBeGreaterThan(shielded.pendingTeamDamage)
  })
})
