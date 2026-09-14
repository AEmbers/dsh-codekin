import { CREATURE_EVOLUTION_LEVEL, CREATURE_ULTIMATE_LEVEL, resolveCreatureAppearance } from '../../engine/src/appearance.ts'
import type { CapturedCreature, CreatureAppearance } from '../../engine/src/types.ts'
import { contentAssetUrl, creatureById } from './content.ts'

export type CreatureLook = Pick<CapturedCreature, 'level' | 'appearance'> & { instanceId?: string | undefined }
export const APPEARANCE_MOTION = { evolution: 1400, change: 380 } as const

export function resolveCreatureSprite(creatureId: string, look: CreatureLook = { level: 1 }) {
  const original = contentAssetUrl(`creature:${creatureId}:sprite`)
  const ultimate = creatureById(creatureId)?.rarity === 'apex' ? contentAssetUrl(`creature:${creatureId}:ultimate`) : undefined
  const appearance = resolveCreatureAppearance(look, ultimate !== undefined)
  const evolved = appearance !== 'original' ? contentAssetUrl(`creature:${creatureId}:evolved`) : undefined
  const source = appearance === 'ultimate' ? ultimate : evolved
  return { source: source ?? original, fallback: original, appearance: source === undefined ? 'original' as const : appearance }
}

export interface PresentedAppearance {
  identity: string
  level: number
  source: string | undefined
  appearance: CreatureAppearance
}

export function appearanceTransition(previous: PresentedAppearance, next: PresentedAppearance): 'none' | 'change' | 'evolution' {
  if (previous.identity !== next.identity || previous.source === next.source) return 'none'
  const threshold = next.appearance === 'ultimate' ? CREATURE_ULTIMATE_LEVEL : CREATURE_EVOLUTION_LEVEL
  return previous.level < threshold && next.level >= threshold && next.appearance !== 'original' ? 'evolution' : 'change'
}

const preparedPictures = new Map<string, { picture: HTMLImageElement; loaded: Promise<boolean>; ready: boolean }>()
const MAX_PREPARED_PICTURES = 8

export function isCreatureImageReady(source: string | undefined): boolean {
  return source !== undefined && preparedPictures.get(source)?.ready === true
}

/** Share pending work and retain a small decoded working set for portrait changes. */
export function decodeCreatureImage(source: string, priority: 'high' | 'low' = 'high'): Promise<boolean> {
  const prepared = preparedPictures.get(source)
  if (prepared !== undefined) {
    preparedPictures.delete(source)
    preparedPictures.set(source, prepared)
    if (priority === 'high') prepared.picture.fetchPriority = 'high'
    return prepared.loaded
  }
  const picture = new Image()
  picture.decoding = 'async'
  picture.fetchPriority = priority
  const loaded = new Promise<boolean>(resolve => {
    picture.onload = () => { resolve(true) }
    picture.onerror = () => { resolve(false) }
  })
  picture.src = source
  const decoded = (async () => {
    if (typeof picture.decode === 'function') {
      try { await picture.decode(); return true } catch { return false }
    }
    return loaded
  })().then(success => {
    picture.onload = null; picture.onerror = null
    entry.ready = success
    if (!success && preparedPictures.get(source) === entry) preparedPictures.delete(source)
    return success
  })
  const entry = { picture, loaded: decoded, ready: false }
  preparedPictures.set(source, entry)
  while (preparedPictures.size > MAX_PREPARED_PICTURES) {
    preparedPictures.delete(preparedPictures.keys().next().value!)
  }
  return decoded
}
