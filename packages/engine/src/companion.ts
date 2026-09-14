import type { CapturedCreature, CompanionLounge, CreatureBond, TraceWildState } from './types.ts'

export const COMPANION_STORY_THRESHOLDS = Object.freeze([5, 20, 50] as const)
export const COMPANION_BOND_LIMIT = 50
export const COMPANION_INTERACTION_POINTS = 5
export const COMPANION_INTERACTION_INTERVAL = 10 * 60 * 1000

export function selectedCompanion(state: TraceWildState): CapturedCreature | undefined {
  return state.creatures.find(row => row.instanceId === state.lounge?.selectedInstanceId)
    ?? state.creatures.find(row => row.instanceId === state.squad[0]) ?? state.creatures[0]
}

export function companionBond(state: TraceWildState, instanceId: string): CreatureBond {
  return state.lounge?.bonds[instanceId] ?? { points: 0, readStories: [] }
}

export function companionInteractionReady(bond: CreatureBond, now: number): boolean {
  return bond.points < COMPANION_BOND_LIMIT && Number.isFinite(now)
    && (bond.lastInteractionAt === undefined || now - bond.lastInteractionAt >= COMPANION_INTERACTION_INTERVAL)
}

export function companionStoryUnlocked(points: number, chapter: number): boolean {
  return Number.isInteger(chapter) && chapter >= 0 && chapter < COMPANION_STORY_THRESHOLDS.length
    && points >= COMPANION_STORY_THRESHOLDS[chapter]!
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined
}

export function restoreCompanionLounge(value: unknown, creatures: readonly CapturedCreature[], now: number): CompanionLounge | undefined {
  const raw = record(value)
  if (raw === undefined) return undefined
  const selected = creatures.find(row => row.instanceId === raw.selectedInstanceId)
  const bonds: CompanionLounge['bonds'] = {}
  const saved = record(raw.bonds)
  for (const creature of creatures) {
    const bond = record(saved?.[creature.instanceId])
    if (bond === undefined) continue
    const points = typeof bond.points === 'number' && Number.isFinite(bond.points)
      ? Math.max(0, Math.min(COMPANION_BOND_LIMIT, Math.floor(bond.points))) : 0
    const lastInteractionAt = typeof bond.lastInteractionAt === 'number' && Number.isFinite(bond.lastInteractionAt)
      && bond.lastInteractionAt >= 0 ? Math.min(Math.floor(bond.lastInteractionAt), now) : undefined
    const readStories = Array.isArray(bond.readStories)
      ? [...new Set(bond.readStories.slice(0, 3).filter((chapter): chapter is number =>
        typeof chapter === 'number' && companionStoryUnlocked(points, chapter)))] : []
    bonds[creature.instanceId] = { points, readStories, ...(lastInteractionAt === undefined ? {} : { lastInteractionAt }) }
  }
  return { bonds, ...(selected === undefined ? {} : { selectedInstanceId: selected.instanceId }) }
}
