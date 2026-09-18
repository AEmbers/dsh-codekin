import { playerStats, wildStats } from './balance.ts'
import { currentEngineContent } from './content.ts'
import { randomId } from './state.ts'
import { EXPEDITION_BOSS_IDS, isExpeditionBoss } from './expedition-catalog.ts'
import type { BattleState, RandomSource, TraceSignal, TraceWildState } from './types.ts'
import type { ExpeditionCombat, ExpeditionPerk, ExpeditionRun, ExpeditionState, ExpeditionSupplies } from './expedition-types.ts'

export const EXPEDITION_BOSS = 'relay-fork-queen'
export const EXPEDITION_COST = 120
export const EXPEDITION_CLUES = 6
export const EXPEDITION_FINAL_NODE = 6
export const EXPEDITION_REWARDS = [4, 0, 6, 0, 8, 0, 12] as const
export const EXPEDITION_NODES = [
  { zh: '链路守卫', en: 'Link Guardian', kind: 'battle', icon: 'shield' },
  { zh: '补给残响', en: 'Supply Echo', kind: 'event', icon: 'material' },
  { zh: '精英岔路', en: 'Elite Crossing', kind: 'battle', icon: 'burst' },
  { zh: '重编工坊', en: 'Recompile Forge', kind: 'event', icon: 'fork' },
  { zh: '镜像核心', en: 'Mirror Core', kind: 'battle', icon: 'mirror' },
  { zh: '终局整备', en: 'Final Camp', kind: 'event', icon: 'beacon' },
  { zh: '未知终点', en: 'Unknown Endpoint', kind: 'battle', icon: 'unknown' },
] as const
export const EXPEDITION_ENEMIES = ['relay-forktail', '', 'aegis-veribud', '', 'lumen-echocoil', '', EXPEDITION_BOSS] as const
export const EXPEDITION_SUPPORTS = ['shuffle', 'cleanse', 'burst'] as const
export const emptySupplies = (): ExpeditionSupplies => ({ shuffle: 0, cleanse: 0, burst: 0 })
export const EXPEDITION_PERKS = [
  { id: 'relay-cache', zh: '接力缓存', en: 'Relay Cache', descZh: '释放主动后，下一位队员获得 2 指令值。每队员每战一次。', descEn: 'Casting grants the next ally 2 command. Once per member per battle.', family: 'charge' },
  { id: 'four-beacon', zh: '四连信标', en: 'Four Beacon', descZh: '直接四连给指令值最低的队员补充 2 点。每次交换一次。', descEn: 'A direct four-match grants the lowest-charge ally 2 command. Once per swap.', family: 'charge' },
  { id: 'blast-loop', zh: '爆破回路', en: 'Blast Circuit', descZh: '同一消除步骤引爆至少 2 个特殊块，追加当前队员 70% 算力伤害。每次交换一次。', descEn: 'Triggering 2 special panels in a step adds 70% acting attack as damage. Once per swap.', family: 'burst' },
  { id: 'shield-heat', zh: '破盾余热', en: 'Shield Heat', descZh: '削减敌方防火墙后，下次伤害提高 25%；不叠加。', descEn: 'Eroding firewall boosts the next hit by 25%. Does not stack.', family: 'burst' },
  { id: 'reserve-barrier', zh: '备用屏障', en: 'Reserve Barrier', descZh: '每战入场获得 12% 共享运行值的防护。', descEn: 'Begin each battle with guard equal to 12% shared runtime.', family: 'guard' },
  { id: 'purify-wave', zh: '净化余波', en: 'Purifying Wave', descZh: '清除危险块后修复 2% 运行值，每次交换至多 6%；无法阻止致命伤害。', descEn: 'Clearing hazard panels repairs 2% runtime each, up to 6% per swap. Cannot revive.', family: 'guard' },
  { id: 'star-trace', zh: '星标追迹', en: 'Star Trace', descZh: '同一交换消除两种属性，施加 1 层标记；最多 3 层。', descEn: 'Matching two attributes in a swap adds 1 Mark, up to 3.', family: 'burst' },
  { id: 'backflow', zh: '回流阀', en: 'Backflow Valve', descZh: '队员充至满指令值，给最低指令值队友 2 点。每队员每战一次，不递归。', descEn: 'Reaching full command gives the lowest-charge ally 2. Once per member per battle; no recursion.', family: 'charge' },
  { id: 'cooling', zh: '冷却管线', en: 'Cooling Line', descZh: '完成战斗后修复 15% 共享运行值。', descEn: 'Repair 15% shared runtime after each victory.', family: 'guard' },
  { id: 'quick-boot', zh: '快速启动', en: 'Quick Boot', descZh: '每战入场时全队获得 3 指令值。', descEn: 'Each ally begins every battle with 3 extra command.', family: 'charge' },
  { id: 'last-reserve', zh: '应急储备', en: 'Last Reserve', descZh: '存活且运行值低于 35% 时，修复 12%。每战一次，不能复活。', descEn: 'While alive below 35% runtime, repair 12%. Once per battle; cannot revive.', family: 'guard' },
  { id: 'module-piercer', zh: '模块穿刺', en: 'Module Piercer', descZh: '攻击首领模块或有防护层的敌人时，伤害提高 35%。', descEn: 'Deal 35% more damage to Boss modules or enemies with a guard layer.', family: 'burst' },
  { id: 'prism-pulse', zh: '棱镜脉冲', en: 'Prism Pulse', descZh: '直接五连追加当前队员 90% 算力伤害。每次交换一次。', descEn: 'A direct five-match adds 90% acting attack as damage. Once per swap.', family: 'burst' },
  { id: 'shared-current', zh: '异色电流', en: 'Shared Current', descZh: '一次交换消除三种属性，全队获得 1 指令值。每次交换一次。', descEn: 'Match three attributes in one swap to grant every ally 1 command. Once per swap.', family: 'charge' },
  { id: 'steady-flow', zh: '稳态循环', en: 'Steady Flow', descZh: '直接四连修复 2% 共享运行值。每次交换一次，不能复活。', descEn: 'A direct four-match repairs 2% shared runtime. Once per swap; cannot revive.', family: 'guard' },
] as const satisfies readonly { id: ExpeditionPerk; zh: string; en: string; descZh: string; descEn: string; family: string }[]

export function initialExpedition(): ExpeditionState {
  return { version: 2, clues: 0, watermark: 0, tutorialDiscovered: false, events: [], shards: 0, clears: 0, recruited: false, unlockedBosses: [], recruitedBosses: [], shopReceipts: [] }
}

/** The watermark prevents evicted signals, history replay and clock rollback minting discoveries. */
export function discoverExpedition(state: TraceWildState, signal: TraceSignal): void {
  if (signal.outcome !== 'completed' || !currentEngineContent().creature(EXPEDITION_BOSS)) return
  const data = state.expedition ??= initialExpedition()
  if (signal.at <= data.watermark) return
  data.watermark = signal.at
  data.clues = Math.min(EXPEDITION_CLUES * 3, data.clues + 1)
  const tutorial = !data.tutorialDiscovered
  if (data.events.length >= 3 || data.clues < EXPEDITION_CLUES) return
  // Separate stream: discoveries never perturb ordinary drops or encounter rolls.
  let seed = 2166136261
  for (const character of signal.id) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0
  seed = (seed ^ signal.at) >>> 0 || 1
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 0x1_0000_0000 }
  data.events.push({
    id: randomId('event', signal.at, random), seed: Math.floor(random() * 0xffff_ffff) || 1,
    source: signal.collaboration === true ? 'collaboration' : 'activity', discoveredAt: signal.at, tutorial,
  })
  data.tutorialDiscovered = true
  data.clues = Math.max(0, data.clues - EXPEDITION_CLUES)
}

export function expeditionRandom(run: ExpeditionRun): RandomSource {
  return () => {
    let x = run.rng >>> 0
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5
    run.rng = x >>> 0 || 1
    return run.rng / 0x1_0000_0000
  }
}

export function expeditionContentId(): string {
  return currentEngineContent().id
}

export function expeditionProfile(run: ExpeditionRun) {
  const content = currentEngineContent()
  const level = Math.max(1, Math.round(run.party.reduce((sum, member) => sum + member.level, 0) / run.party.length))
  const creatureId = run.stage === EXPEDITION_FINAL_NODE ? run.bossId ?? EXPEDITION_BOSS : EXPEDITION_ENEMIES[run.stage]!
  const definition = content.creature(creatureId)!
  const quality = 'prism' as const
  const stats = wildStats(definition, level, quality, run.party.length, level)
  const challenge = run.route === 'unstable-bridge' && run.stage === 2 ? 1.2 : 1
  const tutorial = run.event.tutorial ? 0.7 : 1
  const soloTutorial = run.event.tutorial && run.party.length === 1 ? .85 : 1
  return {
    creatureId, level, quality,
    stats: { ...stats, hp: Math.round(stats.hp * (0.55 + run.stage * 0.065) * challenge * tutorial), attack: Math.round(stats.attack * 0.65 * challenge * tutorial * soloTutorial * (run.stage === EXPEDITION_FINAL_NODE && run.finalPlan === 'sabotage' ? 1.15 : 1)) },
  }
}

export function expeditionCombat(run: ExpeditionRun, battle: BattleState): ExpeditionCombat {
  const moduleMaxHp = Math.max(1, Math.round(battle.wildMaxHp * 0.15 * (run.finalPlan === 'sabotage' ? 0.75 : 1)))
  const boss = run.stage === EXPEDITION_FINAL_NODE
  return { stage: run.stage, perks: [...run.perks], target: 'core', shieldHp: boss ? moduleMaxHp : 0, interferenceHp: boss ? moduleMaxHp : 0, moduleMaxHp, roundDamage: {}, relayUsed: [], overflowUsed: [], heat: 0, supportUsed: false, emergencyUsed: false, overdrive: false, elite: run.stage === 2 && run.route === 'unstable-bridge' }
}

export function advanceExpeditionNode(run: ExpeditionRun): void {
  if (!run.completed.includes(run.stage)) run.completed.push(run.stage)
  run.stage += 1
  if (run.stage === EXPEDITION_FINAL_NODE) {
    const pool = EXPEDITION_BOSS_IDS.filter(id => currentEngineContent().creature(id))
    // The final identity has its own seed: card choices and retries cannot reroll it.
    let seed = run.event.seed >>> 0
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
    run.bossId = run.version === 2 ? EXPEDITION_BOSS : pool[(seed >>> 0) % pool.length] ?? EXPEDITION_BOSS
  }
  run.phase = run.stage === 2 ? 'route' : run.stage % 2 === 1 ? 'event' : 'ready'
}

export function bankExpeditionShards(state: TraceWildState, amount: number): void {
  const data = state.expedition!, run = data.run!
  data.shards = Math.min(999_999, data.shards + amount)
  run.shards += amount
}

export function offerExpeditionPerks(run: ExpeditionRun): void {
  const random = expeditionRandom(run)
  // One offer in each family makes all three builds available on every route.
  run.offers = ['charge', 'burst', 'guard'].flatMap(family => {
    const options = EXPEDITION_PERKS.filter(perk => perk.family === family && !run.perks.includes(perk.id))
    const selected = options[Math.floor(random() * options.length)]
    return selected === undefined ? [] : [selected.id]
  })
}

export function settleExpeditionVictory(state: TraceWildState): void {
  const run = state.expedition!.run!
  const battle = state.battle!
  if (run.phase !== 'battle' || run.rewards.includes(run.stage)) throw new Error('invalid expedition settlement')
  const data = state.expedition!
  const final = run.stage === EXPEDITION_FINAL_NODE
  const shards = EXPEDITION_REWARDS[run.stage]! + (final && data.clears === 0 ? 24 : 0)
    + (run.stage === 2 && run.route === 'unstable-bridge' ? 6 : 0)
    + (final && battle.expedition?.shieldHp === 0 && battle.expedition.interferenceHp === 0 ? 4 : 0)
    + (final && run.finalPlan === 'sabotage' ? 4 : 0)
  run.rewards.push(run.stage)
  bankExpeditionShards(state, shards)
  const materials = final ? 2 : 1
  const quality = run.party.some(member => member.level >= 30) ? 'prism' : 'pulse'
  state.materials[quality] = Math.min(9999, state.materials[quality] + materials)
  state.stats.materialsEarned += materials
  run.materials += materials
  for (const member of battle.party) {
    const captured = state.creatures.find(creature => creature.instanceId === member.instanceId)
    if (captured !== undefined) captured.wins += 1
  }
  run.party = structuredClone(battle.party)
  run.hp = Math.min(run.maxHp, battle.partyHp + (run.perks.includes('cooling') ? Math.round(run.maxHp * 0.15) : 0))
  delete run.checkpoint
  delete run.checkpointRng
  delete run.checkpointSupplies
  delete state.battle
  if (!run.completed.includes(run.stage)) run.completed.push(run.stage)
  if (final) {
    run.phase = 'complete'; data.clears = Math.min(999_999, data.clears + 1)
    const bossId = run.bossId ?? EXPEDITION_BOSS
    if (!data.unlockedBosses.includes(bossId)) data.unlockedBosses.push(bossId)
  }
  else { run.phase = 'upgrade'; offerExpeditionPerks(run) }
}

export function expeditionActive(state: TraceWildState): boolean {
  return state.expedition?.run !== undefined && state.expedition.run.phase !== 'complete'
}

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}
function integer(value: unknown, max: number, fallback = 0): number {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? Math.min(max, value as number) : fallback
}
function ids(value: unknown): ExpeditionPerk[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is ExpeditionPerk => EXPEDITION_PERKS.some(perk => perk.id === id)))].slice(0, 15) : []
}
function supplies(value: unknown): ExpeditionSupplies {
  const raw = object(value)
  return { shuffle: integer(raw?.shuffle, 9), cleanse: integer(raw?.cleanse, 9), burst: integer(raw?.burst, 9) }
}
function event(value: unknown): ExpeditionRun['event'] | undefined {
  const row = object(value)
  if (!row || typeof row.id !== 'string' || !/^event_[a-z0-9_]{8,64}$/.test(row.id)) return
  return { id: row.id, seed: integer(row.seed, 0xffff_ffff, 1) || 1, discoveredAt: integer(row.discoveredAt, Number.MAX_SAFE_INTEGER), source: row.source === 'collaboration' ? 'collaboration' : 'activity', tutorial: row.tutorial === true }
}

/** New fields are optional; incompatible runs safely end while settled currency stays intact. */
export function restoreExpedition(value: unknown, state: TraceWildState): ExpeditionState {
  const row = object(value)
  const data = initialExpedition()
  if (!row) return data
  data.shards = integer(row.shards, 999_999)
  data.clears = integer(row.clears, 999_999)
  data.recruited = row.recruited === true
  data.unlockedBosses = Array.isArray(row.unlockedBosses) ? [...new Set(row.unlockedBosses.filter(isExpeditionBoss))] : []
  data.recruitedBosses = Array.isArray(row.recruitedBosses) ? [...new Set(row.recruitedBosses.filter(isExpeditionBoss))] : []
  if (row.version !== 2 && (data.clears > 0 || data.recruited)) data.unlockedBosses.push(EXPEDITION_BOSS)
  if (data.recruited && !data.recruitedBosses.includes(EXPEDITION_BOSS)) data.recruitedBosses.push(EXPEDITION_BOSS)
  for (const creature of state.creatures) if (isExpeditionBoss(creature.creatureId) && !data.recruitedBosses.includes(creature.creatureId)) data.recruitedBosses.push(creature.creatureId)
  data.unlockedBosses = [...new Set([...data.unlockedBosses, ...data.recruitedBosses])]
  data.recruited = data.recruitedBosses.includes(EXPEDITION_BOSS)
  data.shopReceipts = Array.isArray(row.shopReceipts) ? [...new Set(row.shopReceipts.filter((id): id is string => typeof id === 'string' && /^shop_[a-z0-9_-]{8,64}$/.test(id)))].slice(-64) : []
  data.clues = integer(row.clues, EXPEDITION_CLUES * 3)
  data.watermark = integer(row.watermark, Number.MAX_SAFE_INTEGER)
  data.tutorialDiscovered = row.tutorialDiscovered === true
  data.events = Array.isArray(row.events) ? row.events.slice(0, 3).flatMap(raw => { const next = event(raw); return next ? [next] : [] }) : []
  data.recoveryNotice = row.recoveryNotice === true
  const raw = object(row.run)
  if (!raw) return data
  const discovered = event(raw.event)
  // Unreleased three-battle runs cannot replay against the seven-node rules.
  // Preserve settled rewards and return the discovery once, instead of silently losing entry.
  if (raw.version === 1) {
    data.recoveryNotice = true
    if (raw.phase !== 'complete' && discovered && !data.events.some(item => item.id === discovered.id)) {
      if (data.events.length < 3) data.events.unshift(discovered)
      else data.clues = Math.min(EXPEDITION_CLUES * 3, data.clues + EXPEDITION_CLUES)
    }
    return data
  }
  if (raw.version !== 2 && raw.version !== 3 || raw.content !== expeditionContentId() || !discovered || typeof raw.id !== 'string' || !/^run_[a-z0-9_]{8,64}$/.test(raw.id)
    || !['ready', 'battle', 'upgrade', 'route', 'event', 'failed', 'complete'].includes(String(raw.phase)) || !Array.isArray(raw.party) || raw.party.length < 1 || raw.party.length > 3
    || !Number.isInteger(raw.stage) || Number(raw.stage) < 0 || Number(raw.stage) > EXPEDITION_FINAL_NODE) { data.recoveryNotice = true; return data }
  const stage = Number(raw.stage), phase = String(raw.phase)
  const validPhase = phase === 'event' ? [1, 3, 5].includes(stage) : phase === 'route' ? stage === 2
    : phase === 'complete' ? stage === EXPEDITION_FINAL_NODE : phase === 'upgrade' ? [0, 2, 3, 4].includes(stage) : stage % 2 === 0
  if (!validPhase) { data.recoveryNotice = true; return data }
  const party: ExpeditionRun['party'] = []
  for (const value of raw.party) {
    const member = object(value)
    const captured = state.creatures.find(creature => creature.instanceId === member?.instanceId)
    const definition = captured && currentEngineContent().creature(captured.creatureId)
    if (!captured || !definition || party.some(item => item.instanceId === captured.instanceId)) { data.recoveryNotice = true; return data }
    const stats = playerStats(definition.stats, captured.level, captured.quality)
    party.push({ instanceId: captured.instanceId, creatureId: captured.creatureId, level: captured.level, quality: captured.quality, hp: stats.hp, maxHp: stats.hp, energy: integer(member?.energy, 12), shield: 0, skillUsedStage: false, passiveRound: 0, passiveStage: 0, passiveBattleUsed: false, reviveUsed: false, counterPower: 0, overcharge: 0, stageDamage: 0, frozenStages: 0, skillSealedStages: 0 })
  }
  const maxHp = party.reduce((sum, member) => sum + member.maxHp, 0)
  const stages = EXPEDITION_NODES.map((_, index) => index)
  const completed = Array.isArray(raw.completed) ? stages.filter(stage => (raw.completed as unknown[]).includes(stage)) : []
  data.run = { id: raw.id, version: 2, content: expeditionContentId(), event: discovered, stage: Number(raw.stage), phase: raw.phase as ExpeditionRun['phase'], rng: integer(raw.rng, 0xffff_ffff, 1) || 1, party, maxHp, hp: Math.max(1, integer(raw.hp, maxHp, maxHp)), perks: ids(raw.perks), offers: ids(raw.offers).slice(0, 3), rewards: Array.isArray(raw.rewards) ? [0, 2, 4, 6].filter(stage => (raw.rewards as unknown[]).includes(stage)) : [], completed, choices: {}, supplies: supplies(raw.supplies), shards: integer(raw.shards, 74), materials: integer(raw.materials, 5) }
  data.run.version = raw.version === 3 ? 3 : 2
  if (stage === EXPEDITION_FINAL_NODE) {
    const bossId = raw.version === 2 ? EXPEDITION_BOSS : raw.bossId
    if (!isExpeditionBoss(bossId) || !currentEngineContent().creature(bossId)) { delete data.run; data.recoveryNotice = true; return data }
    data.run.bossId = bossId
  }
  if (['safe-bridge', 'unstable-bridge'].includes(String(raw.route))) data.run.route = raw.route as ExpeditionRun['route'] & string
  if (['repair', 'beacon', 'sabotage'].includes(String(raw.finalPlan))) data.run.finalPlan = raw.finalPlan as NonNullable<ExpeditionRun['finalPlan']>
  const choices = object(raw.choices)
  for (const node of [1, 2, 3, 5]) if (typeof choices?.[node] === 'string' && String(choices[node]).length <= 32) data.run.choices[node] = String(choices[node])
  if (stage === 3 && phase === 'upgrade' && data.run.choices[3] === 'workshop-reforge' && data.run.perks.includes(raw.replacePerk as ExpeditionPerk)) data.run.replacePerk = raw.replacePerk as ExpeditionPerk
  if (phase === 'upgrade' && (data.run.offers.length !== 3 || data.run.offers.some(id => data.run!.perks.includes(id))
    || stage === 3 && (data.run.choices[3] !== 'workshop-install' && !data.run.replacePerk))
    || stage >= 2 && phase !== 'route' && !data.run.route || stage === 6 && !data.run.finalPlan) {
    delete data.run; data.recoveryNotice = true; return data
  }
  if (raw.checkpointRng !== undefined) data.run.checkpointRng = integer(raw.checkpointRng, 0xffff_ffff, 1) || 1
  if (raw.checkpointSupplies !== undefined) data.run.checkpointSupplies = supplies(raw.checkpointSupplies)
  // Checkpoint is restored by the same strict battle loader as the live battle.
  return data
}

export function restoreExpeditionCombat(value: unknown, run: ExpeditionRun, battle: BattleState): ExpeditionCombat {
  const data = expeditionCombat(run, battle)
  const raw = object(value)
  if (!raw) return data
  data.shieldHp = integer(raw.shieldHp, data.shieldHp)
  data.interferenceHp = integer(raw.interferenceHp, data.interferenceHp)
  data.target = raw.target === 'shield' || raw.target === 'interference' ? raw.target : 'core'
  const ecologies = ['lumen', 'forge', 'relay', 'aegis', 'glitch']
  if (ecologies.includes(String(raw.mirror))) data.mirror = raw.mirror as ExpeditionCombat['mirror'] & string
  if (ecologies.includes(String(raw.lastEcology))) data.lastEcology = raw.lastEcology as ExpeditionCombat['lastEcology'] & string
  const roundDamage = object(raw.roundDamage)
  for (const ecology of ecologies) {
    const damage = integer(roundDamage?.[ecology], 999_999_999)
    if (damage > 0) data.roundDamage[ecology as keyof typeof data.roundDamage] = damage
  }
  data.relayUsed = Array.isArray(raw.relayUsed) ? battle.party.filter(member => (raw.relayUsed as unknown[]).includes(member.instanceId)).map(member => member.instanceId) : []
  data.overflowUsed = Array.isArray(raw.overflowUsed) ? battle.party.filter(member => (raw.overflowUsed as unknown[]).includes(member.instanceId)).map(member => member.instanceId) : []
  data.heat = integer(raw.heat, 1)
  data.supportUsed = raw.supportUsed === true
  data.emergencyUsed = raw.emergencyUsed === true
  data.overdrive = raw.overdrive === true
  return data
}
