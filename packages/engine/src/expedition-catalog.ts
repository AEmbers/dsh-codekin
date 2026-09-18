import { MATERIAL_XP } from './balance.ts'

export const EXPEDITION_BOSS_IDS = ['relay-fork-queen', 'forge-dragon-empress', 'lumen-mirror-dreamer', 'aegis-chain-warden', 'glitch-zero-hour', 'glitch-reset-cantor'] as const
export type ExpeditionBossId = typeof EXPEDITION_BOSS_IDS[number]
export const isExpeditionBoss = (value: unknown): value is ExpeditionBossId => EXPEDITION_BOSS_IDS.includes(value as ExpeditionBossId)

export const EXPEDITION_SHOP_ITEMS = [
  { id: 'xp-pulse', quality: 'pulse', cost: 4, xp: MATERIAL_XP.pulse, zh: '脉冲经验芯片', en: 'Pulse XP Chip' },
  { id: 'xp-prism', quality: 'prism', cost: 9, xp: MATERIAL_XP.prism, zh: '棱镜经验芯片', en: 'Prism XP Chip' },
  { id: 'xp-nova', quality: 'nova', cost: 22, xp: MATERIAL_XP.nova, zh: '新星经验芯片', en: 'Nova XP Chip' },
] as const
export type ExpeditionShopItemId = typeof EXPEDITION_SHOP_ITEMS[number]['id']

/** Visible only after the last node reveals its encounter. */
export const EXPEDITION_BOSS_RULES: Record<ExpeditionBossId, { zh: string; en: string; guard: number }> = {
  'relay-fork-queen': { guard: .06, zh: '干扰模块每轮制造危险块；第二阶段批次加倍。', en: 'Interference creates hazards every round; phase II doubles the batches.' },
  'forge-dragon-empress': { guard: .04, zh: '干扰模块每轮制造两批危险块；第二阶段升至三批。优先净化或拆除模块。', en: 'Interference creates two hazard batches each round, three in phase II. Cleanse or break the module.' },
  'lumen-mirror-dreamer': { guard: .06, zh: '干扰模块复制上一轮主攻属性，对该属性减伤 40%。拆除模块解除镜像。', en: 'Interference copies the previous main attribute and resists 40% of it. Break the module to clear the mirror.' },
  'aegis-chain-warden': { guard: .10, zh: '防护模块每轮提供 10% 防护，第二阶段为 15%；干扰模块锁定色块。', en: 'Guard restores 10% protection per round, 15% in phase II. Interference locks panels.' },
  'glitch-zero-hour': { guard: .04, zh: '干扰模块每轮抽走全队 1 指令值，第二阶段为 2。及时施放技能或先拆模块。', en: 'Interference drains one command from every ally each round, two in phase II. Cast early or break the module.' },
  'glitch-reset-cantor': { guard: .04, zh: '干扰模块每轮清除一半队伍防护，第二阶段全部清除，并移除自身标记。', en: 'Interference removes half your guard per round, all in phase II, and clears her Marks.' },
}
