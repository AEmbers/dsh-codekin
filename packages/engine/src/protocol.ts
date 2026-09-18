import { CAPTURE_CORE_QUALITIES } from '../../content-sdk/src/types.ts'
import { MATCH_BOARD_CELLS } from './match3.ts'
import type { CaptureCoreQuality, TraceWildAction } from './types.ts'
import { EXPEDITION_PERKS } from './expedition.ts'
import type { ExpeditionNodeChoice } from './expedition-types.ts'
import { EXPEDITION_SHOP_ITEMS, isExpeditionBoss } from './expedition-catalog.ts'

function plainRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError('invalid action')
  return value as Record<string, unknown>
}

function exactKeys(record: Record<string, unknown>, keys: readonly string[]): void {
  const actual = Object.keys(record)
  if (actual.length !== keys.length || actual.some(key => !keys.includes(key))) throw new TypeError('invalid action')
}

function safeId(value: unknown, prefix?: string): string {
  if (typeof value !== 'string' || value.length < 3 || value.length > 96
    || !/^[a-z0-9_-]+$/.test(value) || (prefix !== undefined && !value.startsWith(prefix))) {
    throw new TypeError('invalid action')
  }
  return value
}

function boardIndex(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) >= MATCH_BOARD_CELLS) {
    throw new TypeError('invalid action')
  }
  return value as number
}

export function normalizeTraceWildAction(value: unknown): TraceWildAction {
  const row = plainRecord(value)
  switch (row.type) {
    case 'expedition-start':
      exactKeys(row, ['type', 'eventId'])
      return { type: row.type, eventId: safeId(row.eventId, 'event_') }
    case 'expedition-continue':
    case 'expedition-retry':
    case 'expedition-leave':
      exactKeys(row, ['type', 'runId'])
      return { type: row.type, runId: safeId(row.runId, 'run_') }
    case 'expedition-perk':
      exactKeys(row, ['type', 'runId', 'perk'])
      if (!EXPEDITION_PERKS.some(perk => perk.id === row.perk)) throw new TypeError('invalid action')
      return { type: row.type, runId: safeId(row.runId, 'run_'), perk: row.perk as typeof EXPEDITION_PERKS[number]['id'] }
    case 'expedition-route':
      exactKeys(row, ['type', 'runId', 'route'])
      if (row.route !== 'repair' && row.route !== 'beacon' && row.route !== 'safe-bridge' && row.route !== 'unstable-bridge') throw new TypeError('invalid action')
      return { type: row.type, runId: safeId(row.runId, 'run_'), route: row.route }
    case 'expedition-target':
      exactKeys(row, ['type', 'runId', 'target'])
      if (row.target !== 'core' && row.target !== 'shield' && row.target !== 'interference') throw new TypeError('invalid action')
      return { type: row.type, runId: safeId(row.runId, 'run_'), target: row.target }
    case 'expedition-recruit':
      exactKeys(row, row.bossId === undefined ? ['type'] : ['type', 'bossId'])
      if (row.bossId !== undefined && !isExpeditionBoss(row.bossId)) throw new TypeError('invalid action')
      return { type: row.type, ...(row.bossId === undefined ? {} : { bossId: row.bossId }) }
    case 'expedition-shop-buy': {
      exactKeys(row, ['type', 'itemId', 'count', 'purchaseId'])
      const item = EXPEDITION_SHOP_ITEMS.find(item => item.id === row.itemId)
      if (!item || !Number.isSafeInteger(row.count) || Number(row.count) < 1 || Number(row.count) > 99) throw new TypeError('invalid action')
      const purchaseId = safeId(row.purchaseId, 'shop_')
      if (!/^shop_[a-z0-9_-]{8,64}$/.test(purchaseId)) throw new TypeError('invalid action')
      return { type: row.type, itemId: item.id, count: Number(row.count), purchaseId }
    }
    case 'expedition-support':
      exactKeys(row, ['type', 'runId', 'support'])
      if (row.support !== 'shuffle' && row.support !== 'cleanse' && row.support !== 'burst') throw new TypeError('invalid action')
      return { type: row.type, runId: safeId(row.runId, 'run_'), support: row.support }
    case 'expedition-node-choice':
      exactKeys(row, row.replace === undefined ? ['type', 'runId', 'node', 'choice'] : ['type', 'runId', 'node', 'choice', 'replace'])
      if (![1, 3, 5].includes(row.node as number) || !['cache-repair', 'cache-charge', 'cache-salvage', 'workshop-install', 'workshop-reforge', 'workshop-stock', 'camp-repair', 'camp-beacon', 'camp-sabotage'].includes(String(row.choice))) throw new TypeError('invalid action')
      if (row.replace !== undefined && (row.choice !== 'workshop-reforge' || !EXPEDITION_PERKS.some(perk => perk.id === row.replace))) throw new TypeError('invalid action')
      return { type: row.type, runId: safeId(row.runId, 'run_'), node: row.node as number, choice: row.choice as ExpeditionNodeChoice, ...(row.replace === undefined ? {} : { replace: row.replace as typeof EXPEDITION_PERKS[number]['id'] }) }
    case 'choose-starter':
      exactKeys(row, ['type', 'creatureId'])
      return { type: 'choose-starter', creatureId: safeId(row.creatureId) }
    case 'start-battle':
      exactKeys(row, ['type', 'encounterId'])
      return { type: 'start-battle', encounterId: safeId(row.encounterId, 'wild_') }
    case 'start-tower':
      exactKeys(row, ['type'])
      return { type: 'start-tower' }
    case 'battle-swap':
      exactKeys(row, ['type', 'from', 'to'])
      return { type: 'battle-swap', from: boardIndex(row.from), to: boardIndex(row.to) }
    case 'battle-cast':
      exactKeys(row, ['type', 'creatureInstanceId'])
      return { type: 'battle-cast', creatureInstanceId: safeId(row.creatureInstanceId, 'pet_') }
    case 'battle-skip-stage':
      exactKeys(row, ['type'])
      return { type: 'battle-skip-stage' }
    case 'battle-continue':
      exactKeys(row, ['type'])
      return { type: 'battle-continue' }
    case 'capture':
      exactKeys(row, ['type', 'quality'])
      if (!CAPTURE_CORE_QUALITIES.includes(row.quality as never)) throw new TypeError('invalid action')
      return { type: 'capture', quality: row.quality as CaptureCoreQuality }
    case 'claim-idle-reward':
      exactKeys(row, ['type'])
      return { type: 'claim-idle-reward' }
    case 'feed-material':
      exactKeys(row, ['type', 'creatureInstanceId', 'quality', 'count'])
      if (!CAPTURE_CORE_QUALITIES.includes(row.quality as never)
        || !Number.isSafeInteger(row.count) || (row.count as number) < 1 || (row.count as number) > 99) {
        throw new TypeError('invalid action')
      }
      return {
        type: 'feed-material',
        creatureInstanceId: safeId(row.creatureInstanceId, 'pet_'),
        quality: row.quality as CaptureCoreQuality,
        count: row.count as number,
      }
    case 'release-creature':
      exactKeys(row, ['type', 'creatureInstanceId'])
      return { type: 'release-creature', creatureInstanceId: safeId(row.creatureInstanceId, 'pet_') }
    case 'set-companion':
    case 'interact-companion':
      exactKeys(row, ['type', 'creatureInstanceId'])
      return { type: row.type, creatureInstanceId: safeId(row.creatureInstanceId, 'pet_') }
    case 'read-companion-story':
      exactKeys(row, ['type', 'creatureInstanceId', 'chapter'])
      if (!Number.isInteger(row.chapter) || (row.chapter as number) < 0 || (row.chapter as number) > 2) throw new TypeError('invalid action')
      return { type: 'read-companion-story', creatureInstanceId: safeId(row.creatureInstanceId, 'pet_'), chapter: row.chapter as number }
    case 'set-creature-appearance':
      exactKeys(row, ['type', 'creatureInstanceId', 'appearance'])
      if (row.appearance !== 'original' && row.appearance !== 'evolved' && row.appearance !== 'ultimate') throw new TypeError('invalid action')
      return {
        type: 'set-creature-appearance',
        creatureInstanceId: safeId(row.creatureInstanceId, 'pet_'),
        appearance: row.appearance,
      }
    case 'flee':
      exactKeys(row, ['type'])
      return { type: 'flee' }
    case 'set-squad': {
      exactKeys(row, ['type', 'instanceIds'])
      if (!Array.isArray(row.instanceIds) || row.instanceIds.length < 1 || row.instanceIds.length > 3) {
        throw new TypeError('invalid action')
      }
      return { type: 'set-squad', instanceIds: row.instanceIds.map(id => safeId(id, 'pet_')) }
    }
    case 'set-enabled':
      exactKeys(row, ['type', 'enabled'])
      if (typeof row.enabled !== 'boolean') throw new TypeError('invalid action')
      return { type: 'set-enabled', enabled: row.enabled }
    default:
      throw new TypeError('invalid action')
  }
}
