import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { ExpeditionNodeChoice, ExpeditionPerk, ExpeditionRun } from '../../../engine/src/expedition-types.ts'
import type { TraceWildAction } from '../../../engine/src/types.ts'
import { EXPEDITION_PERKS } from '../../../engine/src/expedition.ts'
import { ExpeditionIcon } from './ExpeditionGraphics.tsx'
import type { ExpeditionGlyph } from './ExpeditionGraphics.tsx'
import css from './expedition.module.css'

export function ExpeditionEventChoices({ run, zh, disabled, act }: { run: ExpeditionRun; zh: boolean; disabled: boolean; act: (action: TraceWildAction) => void }) {
  const [selected, setSelected] = useState<ExpeditionNodeChoice>()
  const [replace, setReplace] = useState<ExpeditionPerk>()
  const t = (cn: string, en: string) => zh ? cn : en
  const heal = (ratio: number) => Math.min(run.maxHp, run.hp + Math.round(run.maxHp * ratio)).toLocaleString()
  const options: { id: ExpeditionNodeChoice; icon: ExpeditionGlyph; name: string; value: string; caption: string; detail: string; cost?: number }[] = run.stage === 1 ? [
    { id: 'cache-repair', icon: 'repair', name: t('维护缓存', 'Repair Cache'), value: '+20%', caption: t('修复与净化', 'REPAIR'), detail: t(`运行值恢复至 ${heal(.2)}，获得 1 次净化支援。`, `Restore runtime to ${heal(.2)} and gain one Cleanse support.`) },
    { id: 'cache-charge', icon: 'charge', name: t('高能电池', 'Power Cell'), value: '+2', caption: t('全队指令值', 'COMMAND'), detail: t('全队立即获得 2 指令值，并获得 1 次爆破支援。', 'Every ally gains two command. Gain one Burst support.') },
    { id: 'cache-salvage', icon: 'shard', name: t('深入回收', 'Deep Salvage'), value: '+6', caption: t('碎片立即入账', 'SHARDS'), cost: Math.ceil(run.maxHp * .12), detail: t(`消耗 ${Math.ceil(run.maxHp * .12)} 运行值，立即获得 6 碎片与 1 次重排支援。`, `Spend ${Math.ceil(run.maxHp * .12)} runtime. Bank six shards and gain one Shuffle support.`) },
  ] : run.stage === 3 ? [
    { id: 'workshop-install', icon: 'burst', name: t('超频装配', 'Overclock'), value: '+1', caption: t('额外强化', 'EXTRA PERK'), cost: Math.ceil(run.maxHp * .15), detail: t(`消耗 ${Math.ceil(run.maxHp * .15)} 运行值，再从三张卡中选择一项额外强化。`, `Spend ${Math.ceil(run.maxHp * .15)} runtime, then choose one additional perk from three cards.`) },
    { id: 'workshop-reforge', icon: 'fork', name: t('重编强化', 'Recompile'), value: '1 → 1', caption: t('免费调整构筑', 'REPLACE'), detail: t('指定一项已有强化，再从三张新卡中选择替代项。旧强化在确认新卡后才移除。', 'Choose an owned perk, then replace it with one of three new cards. The old perk stays until you confirm the replacement.') },
    { id: 'workshop-stock', icon: 'material', name: t('支援补给', 'Stock Up'), value: '+2', caption: t('战术道具', 'SUPPORTS'), detail: t('获得 1 次重排支援和 1 次净化支援，保留当前强化与运行值。', 'Gain one Shuffle and one Cleanse support. Keep your current perks and runtime.') },
  ] : [
    { id: 'camp-repair', icon: 'repair', name: t('维修营地', 'Repair Camp'), value: '+30%', caption: t('恢复运行值', 'REPAIR'), detail: t(`运行值恢复至 ${heal(.3)}，再获得 1 次净化支援。`, `Restore runtime to ${heal(.3)} and gain one Cleanse support.`) },
    { id: 'camp-beacon', icon: 'beacon', name: t('协作信标', 'Relay Beacon'), value: '+3', caption: t('终局全队充能', 'FINAL CHARGE'), detail: t('最终战每位队员额外获得 3 指令值，入场带一个爆破块，并获得 1 次爆破支援。', 'Final battle: every ally gains three command. Start with a burst panel and gain one Burst support.') },
    { id: 'camp-sabotage', icon: 'mirror', name: t('潜入破坏', 'Sabotage'), value: '−25%', caption: t('两模块运行值', 'MODULE HP'), detail: t('最终战两模块运行值降低 25%；首领算力提高 15%。通关额外获得 4 碎片。', 'Final modules have 25% less HP, but the Boss gains 15% attack. Clear for four extra shards.') },
  ]
  const choice = options.find(option => option.id === selected)
  const cannotPay = choice?.cost !== undefined && run.hp <= choice.cost
  return <>
    <div className={css.perkCards}>{options.map((option, index) => <button type="button" key={option.id} data-family={(['guard', 'charge', 'burst'] as const)[index]} style={{ '--order': index } as CSSProperties} aria-pressed={selected === option.id} disabled={disabled} onClick={() => setSelected(option.id)}><small>{option.caption}</small><ExpeditionIcon kind={option.icon} /><strong>{option.value}</strong><b>{option.name}</b></button>)}</div>
    <div className={css.choiceDetail} aria-live="polite">{choice ? <><b>{choice.name}</b><p>{choice.detail}</p>{cannotPay && <small>{t('运行值不足，无法安全执行。', 'Not enough runtime to survive this choice.')}</small>}</> : <p>{t('点选一个方案，比较收益与代价。每个节点只能执行一次。', 'Preview the tradeoff. Each node allows one decision.')}</p>}</div>
    {selected === 'workshop-reforge' && <label className={css.replaceChoice}>{t('替换的强化', 'Perk to replace')}<select aria-label={t('替换的强化', 'Perk to replace')} value={replace ?? ''} onChange={event => setReplace(event.target.value as ExpeditionPerk)}><option value="">{t('请选择', 'Choose a perk')}</option>{run.perks.map(id => { const perk = EXPEDITION_PERKS.find(item => item.id === id)!; return <option value={id} key={id}>{zh ? perk.zh : perk.en}</option> })}</select></label>}
    <button type="button" className={css.primary} disabled={disabled || !choice || cannotPay || selected === 'workshop-reforge' && !replace} onClick={() => { if (choice) act({ type: 'expedition-node-choice', runId: run.id, node: run.stage, choice: choice.id, ...(choice.id === 'workshop-reforge' && replace ? { replace } : {}) }) }}>{t('执行方案', 'Confirm decision')}</button>
  </>
}
