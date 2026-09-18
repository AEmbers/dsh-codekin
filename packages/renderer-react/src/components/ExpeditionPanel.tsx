import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { EXPEDITION_CLUES, EXPEDITION_PERKS, EXPEDITION_NODES, EXPEDITION_FINAL_NODE, EXPEDITION_SUPPORTS } from '../../../engine/src/expedition.ts'
import { EXPEDITION_BOSS_RULES, isExpeditionBoss } from '../../../engine/src/expedition-catalog.ts'
import { ExpeditionShop } from './ExpeditionShop.tsx'
import type { TraceWildAction, TraceWildState, BattleState } from '../../../engine/src/types.ts'
import type { ExpeditionTarget, ExpeditionRun, ExpeditionSupplies, ExpeditionSupport } from '../../../engine/src/expedition-types.ts'
import { contentAssetUrl, creatureById } from '../content.ts'
import { CreatureSprite, creatureName } from './creature-presentation.tsx'
import { PanelDialog, PageControls } from './PanelDialog.tsx'
import { SignalMesh } from './GraphicAccents.tsx'
import { ExpeditionEventChoices } from './ExpeditionEventChoices.tsx'
import { ExpeditionIcon, ExpeditionRouteMap, PERK_VISUALS, RouteIllustration } from './ExpeditionGraphics.tsx'
import css, { styleText } from './expedition.module.css'

export const expeditionStageName = (stage: number, zh: boolean) => (zh ? EXPEDITION_NODES[stage]?.zh : EXPEDITION_NODES[stage]?.en) ?? ''
export const expeditionStageHint = (stage: number, zh: boolean) => (zh ? [
  '每轮重建防护。直接四连可以清除防护层。', '选择修复、充能或消耗运行值深入回收。可获得仅供本局使用的战术支援。', '安全路线获得 10% 防护。精英路线敌方运行值与算力 +20%，持续制造危险块，开场有爆破块，胜利额外 6 碎片。', '消耗 15% 运行值增添强化、免费置换一项已有强化，或领取重排与净化支援。', '复制上一轮主攻属性，该颜色伤害降低 40%。换色进攻仍可造成完整伤害。', '选择恢复运行值、终局充能，或削弱模块但提高首领算力的潜入方案。', '每轮首次消除前选择核心或模块。击破防护模块停止加盾，击破干扰模块停止其专属干扰；先拆双模块再获胜，额外获得 4 碎片。核心低于一半运行值进入第二阶段：算力 +20%，存活模块的护盾与干扰增强，已破坏模块不复活。',
] : [
  'Guard rebuilds each round. A direct four-match removes it.', 'Repair, charge, or trade runtime for salvage. Earn tactical supplies for this run.', 'Safe route: 10% starting guard. Elite: enemy HP/attack +20%, recurring hazards, a starting burst panel and six bonus shards on victory.', 'Spend 15% runtime for another perk, replace an owned perk for free, or take Shuffle and Cleanse supports.', 'Copies the previous round’s main attribute, resisting 40% of that color’s damage. Other colors deal full damage.', 'Repair, charge for the finale, or weaken modules at the cost of a stronger Boss.', 'Choose the core or a module before matching each round. Break Guard to stop shields and Interference to disable its special effect. Break both before winning for four bonus shards. Below half core HP: attack +20%, stronger surviving modules. Destroyed modules stay down.',
])[stage] ?? ''
const meter = (value: number, max: number): CSSProperties => ({ '--fill': `${Math.min(100, Math.max(0, value / Math.max(1, max) * 100))}%` } as CSSProperties)
const familyName = (family: string, zh: boolean) => ({ charge: zh ? '接力充能' : 'CHARGE', burst: zh ? '连锁爆发' : 'BURST', guard: zh ? '防护修复' : 'GUARD' })[family]

const supportName = (kind: ExpeditionSupport, zh: boolean) => ({ shuffle: zh ? '重排' : 'Shuffle', cleanse: zh ? '净化' : 'Cleanse', burst: zh ? '爆破' : 'Burst' })[kind]
const supportIcon = { shuffle: 'fork', cleanse: 'repair', burst: 'burst' } as const
const supportHint = (kind: ExpeditionSupport, zh: boolean) => (zh ? {
  shuffle: '重新布置棋盘颜色，保留特殊块数量和原格子的危险、锁定状态。', cleanse: '清除棋盘所有危险与锁定状态，并修复 6% 共享运行值。', burst: '将中央一格变为爆破块，保留原颜色，等待你引爆。',
} : { shuffle: 'Rebuild panel colors, retaining special counts and the original hazard and lock positions.', cleanse: 'Clear every hazard and lock, and repair 6% shared runtime.', burst: 'Turn a central panel into a burst panel, keeping its color, ready for your next match.' })[kind]

export function ExpeditionCombatPanel({ battle, runId, supplies, zh, busy, act, reducedMotion = false }: { battle: BattleState; runId: string; supplies?: ExpeditionSupplies | undefined; zh: boolean; busy: boolean; act: (action: TraceWildAction) => void; reducedMotion?: boolean }) {
  const combat = battle.expedition
  const [help, setHelp] = useState(false)
  const [support, setSupport] = useState<ExpeditionSupport>()
  useEffect(() => { if (combat?.supportUsed) setSupport(undefined) }, [combat?.supportUsed])
  if (!combat) return null
  const revealed = combat.stage === EXPEDITION_FINAL_NODE ? creatureById(battle.wildCreatureId) : undefined
  const stageName = revealed ? creatureName(revealed, zh) : expeditionStageName(combat.stage, zh)
  const bossRule = isExpeditionBoss(battle.wildCreatureId) ? EXPEDITION_BOSS_RULES[battle.wildCreatureId] : undefined
  const labels = zh ? { core: '核心', shield: '防护模块', interference: '干扰模块' } : { core: 'Core', shield: 'Guard', interference: 'Interference' }
  return <div className={css.combat} data-motion={reducedMotion ? 'reduce' : 'full'}>
    <style data-plugin-css="codekin-expedition">{styleText}</style>
    <div className={css.combatHeading}><span>{stageName} · {combat.stage + 1}/7 {combat.overdrive ? 'Ⅱ' : ''}</span><button type="button" onClick={() => setHelp(true)} aria-label={zh ? '阶段机制说明' : 'Stage mechanics'}>?</button></div>
    <div className={css.supports} aria-label={zh ? '每战一次战术支援' : 'One support per battle'}>{EXPEDITION_SUPPORTS.map(kind => <button type="button" key={kind} title={supportHint(kind, zh)} aria-label={`${supportName(kind, zh)} ${zh ? '支援' : 'support'} ×${supplies?.[kind] ?? 0}`} disabled={busy || combat.supportUsed || !supplies?.[kind] || battle.turnOwner !== 'player' || battle.actionsRemaining <= 0} onClick={() => setSupport(kind)}><ExpeditionIcon kind={supportIcon[kind]} /><b>{supplies?.[kind] ?? 0}</b></button>)}</div>
    <div key={`${runId}:${combat.stage}:${combat.overdrive}`} className={css.battleIntro} aria-hidden="true">{combat.overdrive ? 'OVERDRIVE / PHASE II' : combat.stage === EXPEDITION_FINAL_NODE ? 'BOSS ENCOUNTER' : 'LINK ESTABLISHED'} / 0{combat.stage + 1}</div>
    {combat.stage === EXPEDITION_FINAL_NODE ? <div className={css.targets}>{(['core', 'shield', 'interference'] as ExpeditionTarget[]).map(target => {
      const hp = target === 'core' ? battle.wildHp : target === 'shield' ? combat.shieldHp : combat.interferenceHp
      return <button key={target} type="button" aria-pressed={combat.target === target} data-broken={hp <= 0 || undefined} disabled={busy || hp <= 0 || battle.turnOwner !== 'player' || battle.pendingTeamDamage > 0}
        onClick={() => act({ type: 'expedition-target', runId, target })}><ExpeditionIcon kind={target === 'core' ? 'crown' : target === 'shield' ? 'shield' : 'beacon'} /><span>{labels[target]}<b>{hp <= 0 ? zh ? '已破坏' : 'DESTROYED' : hp.toLocaleString()}</b></span><i className={css.meter} style={meter(hp, target === 'core' ? battle.wildMaxHp : combat.moduleMaxHp)} /></button>
    })}</div> : <div className={css.mechanic}><ExpeditionIcon kind={combat.stage === 0 ? 'shield' : combat.stage === 2 ? 'burst' : 'mirror'} /><span>{combat.stage === 0 ? zh ? '四连破盾' : 'Match four to break guard' : combat.stage === 2 ? combat.elite ? zh ? '精英：危险块 / 胜利 +6 碎片' : 'Elite: hazards / +6 shards' : zh ? '安全通道：开场防护' : 'Safe crossing: starting guard' : combat.mirror ? `${zh ? '镜像抗性' : 'Resists'}: ${({ lumen: zh ? '智算' : 'Compute', forge: zh ? '编译' : 'Compile', relay: zh ? '网络' : 'Network', aegis: zh ? '防护' : 'Guard', glitch: zh ? '异常' : 'Glitch' })[combat.mirror]} −40%` : zh ? '下一轮复制主攻属性' : 'Copies your main color next round'}</span><small>{combat.supportUsed ? zh ? '支援已使用' : 'Support used' : zh ? '本战可用 1 次支援' : 'One support this battle'}</small></div>}
    {help && <PanelDialog title={stageName} closeLabel={zh ? '关闭' : 'Close'} onClose={() => setHelp(false)}><p>{expeditionStageHint(combat.stage, zh)}</p>{bossRule && <p>{zh ? bossRule.zh : bossRule.en}</p>}</PanelDialog>}
    {support && <PanelDialog title={supportName(support, zh)} closeLabel={zh ? '关闭' : 'Close'} onClose={() => setSupport(undefined)}><div className={css.panel}><p>{supportHint(support, zh)}</p><p>{zh ? '每战只能使用一种支援。不消耗交换次数；免费重试时恢复入场库存。' : 'One support per battle. Costs no swaps; a free retry restores the entry stock.'}</p><button type="button" className={css.primary} disabled={busy || combat.supportUsed || battle.turnOwner !== 'player'} onClick={() => act({ type: 'expedition-support', runId, support })}>{zh ? '使用支援' : 'Use support'}</button></div></PanelDialog>}
  </div>
}

export function ExpeditionPanel({ state, zh, busy, act, reducedMotion = false }: { state: TraceWildState; zh: boolean; busy: boolean; act: (action: TraceWildAction) => void; reducedMotion?: boolean }) {
  const [view, setView] = useState<'hub' | 'guide' | 'recruit' | 'leave'>()
  const [eventIndex, setEventIndex] = useState(0)
  const [guidePage, setGuidePage] = useState(0)
  const [selection, setSelection] = useState<string>()
  const [detail, setDetail] = useState<{ title: string; body: string }>()
  const data = state.expedition, run = data?.run
  const phaseKey = `${run?.id ?? 'discover'}:${run?.stage ?? 0}:${run?.phase ?? 'hub'}`
  const previousPhase = useRef(run?.phase)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (previousPhase.current === 'battle' && run?.phase && run.phase !== 'battle') setView('hub')
    if (previousPhase.current !== 'battle' && run?.phase === 'battle') setView(undefined)
    previousPhase.current = run?.phase
    setSelection(undefined)
  }, [phaseKey, run?.phase])
  useEffect(() => { if (view === 'hub') heading.current?.focus({ preventScroll: true }) }, [phaseKey, view])
  const boss = run?.stage === EXPEDITION_FINAL_NODE && run.bossId ? creatureById(run.bossId) : undefined
  const choice = data?.events[Math.min(eventIndex, Math.max(0, data.events.length - 1))]
  const text = (cn: string, en: string) => zh ? cn : en
  const close = () => setView(undefined)
  const inspectStage = (stage: number) => {
    const rule = boss && isExpeditionBoss(boss.id) ? EXPEDITION_BOSS_RULES[boss.id] : undefined
    setDetail({ title: stage === EXPEDITION_FINAL_NODE && boss ? creatureName(boss, zh) : expeditionStageName(stage, zh), body: stage === EXPEDITION_FINAL_NODE && !boss ? text('终点信号尚未解密。抵达第七节点后，才会揭晓首领身份与战术情报。', 'Endpoint signal encrypted. Reach node seven to reveal the Boss and tactical information.') : expeditionStageHint(stage, zh) + (stage === EXPEDITION_FINAL_NODE && rule ? '\n\n' + (zh ? rule.zh : rule.en) : '') })
  }
  const disabled = busy || !state.enabled
  const selectedPerk = EXPEDITION_PERKS.find(perk => perk.id === selection && run?.offers.includes(perk.id))
  const routes: { id: NonNullable<ExpeditionRun['route']>; kind: 'safe' | 'risk'; name: string; value: string; benefit: string; description: string }[] = [
    { id: 'safe-bridge', kind: 'safe', name: text('安全桥', 'Safe Bridge'), value: '+10%', benefit: text('入场防护', 'Starting guard'), description: text('下一战获得 10% 共享运行值的防护。稳妥保存队伍状态。', 'Start the next battle with guard equal to 10% shared runtime. Preserve your squad for the final battle.') },
    { id: 'unstable-bridge', kind: 'risk', name: text('不稳定桥', 'Unstable Bridge'), value: '+6', benefit: text('额外碎片', 'Bonus shards'), description: text('敌方运行值与算力 +20%，持续制造危险块；入场获得爆破块，胜利额外 6 碎片。', 'Enemy HP and attack +20%, with recurring hazards. Start with a burst panel; win for six extra shards.') },
  ]
  const selectedRoute = routes.find(route => route.id === selection)
  const guides = [
    { icon: 'fork', title: text('日常协作，发现岔路', 'Work together. Discover a path.'), body: text('完成 DSH 回合或真实子代理协作积累线索，每 6 点开启一局未知探索，首次为教学探索。最多保留 3 个事件，不限时消失。', 'Completed DSH turns and real subagent collaborations build clues. Six unlock an unknown expedition; the first is a tutorial. Up to three discoveries stay available without expiring.') },
    { icon: 'charge', title: text('七个节点，逐步构筑', 'Seven nodes. Build your squad.'), body: text('四场战斗继承队伍运行值与指令值。前三战胜利后各三选一强化，卡池共 15 项；途中选择补给、精英路线、工坊改装和终局整备。工坊可以增添第四项强化，也可置换不合适的强化。', 'Four battles carry runtime and command. Pick one perk after each of the first three victories from a pool of 15. Choose supplies, an elite route, a forge upgrade and a final camp. The forge can add a fourth perk or replace one.') },
    { icon: 'material', title: text('战术支援，择机使用', 'Tactical support. Choose your moment.'), body: text('每战限用一次支援：重排棋盘、净化危险并治疗，或植入爆破块。不消耗交换次数；道具来自探索节点。终点首领低于半血进入第二阶段，优先拆除模块可以降低后续压力。', 'Use one support per battle: Shuffle, Cleanse with healing, or plant a Burst panel. Costs no swaps. Nodes replenish supplies. The final Boss enters phase II below half HP. Break modules first to reduce pressure.') },
    { icon: 'shard', title: text('逐战入账，失败可重试', 'Bank each victory. Retry freely.'), body: text('四战获得 4 / 6 / 8 / 12 碎片与 1 / 1 / 1 / 2 份素材，首通额外 24 碎片。精英、回收、破坏双模块及潜入方案另有奖励。免费重试恢复本战入场队伍、棋盘和支援库存，奖励不会重复发放。', 'Four victories bank 4 / 6 / 8 / 12 shards and 1 / 1 / 1 / 2 materials. First clear adds 24 shards. Elite, salvage, breaking both modules and sabotage give bonuses. Free retry restores the battle entry squad, board and supplies without duplicating rewards.') },
    { icon: 'crown', title: text('通关相遇，永久招募', 'Clear, meet, recruit'), body: text('前六个节点隐藏首领身份，第七节点揭晓。通关后，该首领永久加入招募商店，可用 120 异常碎片兑换一次。碎片也可兑换经验芯片，在码灵升级中使用。', 'The Boss stays unknown through six nodes and is revealed at node seven. Defeat her to permanently unlock a one-time recruitment for 120 shards. Shards also buy XP chips for creature upgrades.') },
  ] as const
  const guide = guides[guidePage]!
  const title = !run ? text('未知探索', 'Unknown Expedition') : run.phase === 'upgrade' ? text('选择一项当局强化', 'Choose a perk for this run') : run.phase === 'route' ? text('选择下一条岔路', 'Choose your next path') : run.phase === 'complete' ? text('岔路，终于汇合', 'Branches, reunited') : run.phase === 'failed' ? text('链路暂时中断', 'Link interrupted') : boss ? creatureName(boss, zh) : expeditionStageName(run.stage, zh)
  return <div className={css.entry}>
    <style data-plugin-css="codekin-expedition">{styleText}</style>
    <button type="button" className={css.launch} onClick={() => setView('hub')} aria-haspopup="dialog">
      <ExpeditionIcon kind="fork" className={css.symbol} /><span><small>ANOMALY / EXPEDITION</small><strong>{text('未知探索', 'Unknown Expedition')}</strong><em>{run ? text('继续你的探索', 'Resume your expedition') : text(`${data?.events.length ?? 0} 个待探索 · 线索 ${data?.clues ?? 0}/${EXPEDITION_CLUES}`, `${data?.events.length ?? 0} discoveries · clues ${data?.clues ?? 0}/${EXPEDITION_CLUES}`)}</em></span><b>{text('进入', 'OPEN')} ↗</b>
    </button>
    {view !== undefined && <PanelDialog title={text('异常探索', 'Anomaly Expedition')} closeLabel={text('关闭', 'Close')} onClose={close}>
      <div className={css.panel} data-expedition-view={view} data-motion={reducedMotion ? 'reduce' : 'full'}>
        <nav className={css.tabs} aria-label={text('探索栏目', 'Expedition sections')}>
          {(['hub', 'recruit', 'guide'] as const).map((tab, index) => <button key={tab} type="button" aria-pressed={view === tab} onClick={() => setView(tab)}><ExpeditionIcon kind={(['fork', 'crown', 'beacon'] as const)[index]!} />{(zh ? ['探索', '招募商店', '玩法说明'] : ['Explore', 'Shop', 'Guide'])[index]}</button>)}
        </nav>
        <div key={`${view}:${phaseKey}`} className={css.phase} data-expedition-phase={run?.phase ?? 'discovery'}>
          {view === 'guide' && <div className={css.guide}>
            <div className={css.guideArt}><ExpeditionIcon kind={guide.icon} /><b>0{guidePage + 1}</b><SignalMesh className={css.mesh} /></div>
            <h3>{guide.title}</h3><p>{guide.body}</p><PageControls page={guidePage} pages={guides.length} onChange={setGuidePage} zh={zh} />
            <small>{text('只使用活动类别，不读取提示词、回复、命令或文件内容。', 'Only activity categories are used, never prompts, replies, commands or file contents.')}</small>
          </div>}
          {view === 'recruit' && <ExpeditionShop state={state} zh={zh} busy={busy} act={act} />}
          {view === 'leave' && <><h3>{text('结束本次探索？', 'End this expedition?')}</h3><p>{text('已入账的碎片和素材保留；本局强化和未完成的阶段将结束。', 'Banked shards and materials stay yours. This run’s perks and unfinished stages will end.')}</p><div className={css.actions}><button type="button" onClick={() => setView('hub')}>{text('继续探索', 'Keep exploring')}</button><button type="button" disabled={disabled} onClick={() => { if (run) act({ type: 'expedition-leave', runId: run.id }); setView('hub') }}>{text('结束并保留奖励', 'End and keep rewards')}</button></div></>}
          {view === 'hub' && (!run ? <>
            <div className={`${css.hero} ${css.mystery}`}><SignalMesh className={css.mesh} /><div className={css.sealedGate} aria-hidden="true"><ExpeditionIcon kind="unknown" /><span>SIGNAL ENCRYPTED</span></div><div><small>UNKNOWN / 07</small><h3>{title}</h3><p>{text('循着线索前进，终点等待揭晓。', 'Follow the clues. Discover who awaits.')}</p><span className={css.tag}>{text('七节点 · 四场连战', '7 NODES / 4 BATTLES')}</span></div></div>
            <ExpeditionRouteMap stage={0} done={[]} zh={zh} onInspect={inspectStage} />
            {data?.recoveryNotice && <small role="status">{text('旧探索已安全结束，奖励保留；未完成的三节点探索已返还入口。', 'Old runs were safely closed. Rewards remain; unfinished three-node runs refunded their entry.')}</small>}
            {choice ? <>
              <div className={css.events}>{data?.events.map((event, index) => <button type="button" key={event.id} aria-pressed={event.id === choice.id} onClick={() => setEventIndex(index)}>{event.tutorial ? text('未知探索 · 教学', 'Unknown · Tutorial') : `${text('未知探索', 'Unknown')} ${index + 1}`}</button>)}<span>{choice.source === 'collaboration' ? text('线索 6/6 · 协作发现', 'Clues 6/6 · Collaboration') : text('线索 6/6 · 活动发现', 'Clues 6/6 · Activity')}</span></div>
              <div className={css.loot}><span><ExpeditionIcon kind="shard" /><b>30+</b>{text('碎片', 'shards')}</span><span><ExpeditionIcon kind="material" /><b>5</b>{text('素材', 'materials')}</span>{!data?.clears && <small>{text('首通额外 +24 碎片', 'First clear +24 shards')}</small>}</div>
              <button type="button" className={css.primary} disabled={disabled || !state.starterChosen || !!state.battle || state.squad.length === 0} onClick={() => act({ type: 'expedition-start', eventId: choice.id })}>{text('以当前队伍开始探索', 'Explore with current squad')}</button>
            </> : <div className={css.empty}><strong>{text('线索收集中', 'Gathering clues')} · {data?.clues ?? 0}/{EXPEDITION_CLUES}</strong><div className={css.clues}>{Array.from({ length: EXPEDITION_CLUES }, (_, index) => <i key={index} data-lit={index < (data?.clues ?? 0) || undefined} />)}</div><small>{text('继续完成 DSH 回合，集齐 6 点后开启未知路线。', 'Complete DSH turns. Six clues unlock an unknown route.')}</small></div>}
          </> : <>
            <ExpeditionRouteMap finalName={boss ? creatureName(boss, zh) : undefined} stage={run.stage} done={run.completed} zh={zh} onInspect={inspectStage} />
            <div className={css.metrics}><span>{text('队伍运行值', 'Squad runtime')}<b>{(run.phase === 'battle' ? state.battle?.partyHp ?? run.hp : run.hp).toLocaleString()} <small>/ {run.maxHp.toLocaleString()}</small></b><i className={css.meter} style={meter(run.phase === 'battle' ? state.battle?.partyHp ?? run.hp : run.hp, run.maxHp)} /></span><span className={css.banked} key={run.rewards.length}><small>{text('已入账', 'BANKED')}</small><b><ExpeditionIcon kind="shard" />{run.shards}<ExpeditionIcon kind="material" />{run.materials}</b></span></div>
            <div className={css.phaseHeading}><h3 ref={heading} tabIndex={-1}>{title}</h3><small>{run.phase === 'upgrade' ? 'SELECT 1 / 3' : run.phase === 'route' ? 'CHOOSE YOUR WAY' : `SECTOR 0${run.stage + 1}`}</small></div>
            {run.phase === 'upgrade' ? <>
              <div className={css.perkCards}>{run.offers.map((id, index) => {
                const perk = EXPEDITION_PERKS.find(item => item.id === id)!, visual = PERK_VISUALS[id]
                const synergy = run.perks.some(owned => EXPEDITION_PERKS.find(item => item.id === owned)?.family === perk.family)
                return <button key={id} type="button" data-family={perk.family} aria-pressed={selection === id} disabled={disabled} style={{ '--order': index } as CSSProperties} onClick={() => setSelection(id)}><small>{familyName(perk.family, zh)}</small><ExpeditionIcon kind={visual.icon} /><strong>{visual.value}</strong><b>{zh ? perk.zh : perk.en}</b>{synergy && <i>{text('连携', 'SYNERGY')}</i>}</button>
              })}</div>
              <div className={css.choiceDetail} aria-live="polite">{selectedPerk ? <><b>{zh ? selectedPerk.zh : selectedPerk.en}</b><p>{zh ? selectedPerk.descZh : selectedPerk.descEn}</p></> : <p>{text('点选卡牌预览效果，再装配到当前队伍。', 'Select a card to preview its effect, then install it for this run.')}</p>}</div>
              <button type="button" className={css.primary} disabled={disabled || !selectedPerk} onClick={() => { if (selectedPerk) act({ type: 'expedition-perk', runId: run.id, perk: selectedPerk.id }) }}>{text('装配强化', 'Install perk')}{selectedPerk ? ` · ${zh ? selectedPerk.zh : selectedPerk.en}` : ''}</button>
            </> : run.phase === 'route' ? <>
              <div className={css.routeCards}>{routes.map(option => <button key={option.id} type="button" data-kind={option.kind} aria-pressed={selection === option.id} disabled={disabled} onClick={() => setSelection(option.id)}><RouteIllustration kind={option.kind} /><b>{option.name}</b><strong>{option.value}</strong><small>{option.benefit}</small></button>)}</div>
              <div className={css.choiceDetail} aria-live="polite">{selectedRoute ? <><b>{selectedRoute.name}</b><p>{selectedRoute.description}</p></> : <p>{text('防护或额外奖励：点选一条路线，查看风险与收益。', 'Guard or extra rewards: select a path to preview the tradeoff.')}</p>}</div>
              <button type="button" className={css.primary} disabled={disabled || !selectedRoute} onClick={() => { if (selectedRoute) act({ type: 'expedition-route', runId: run.id, route: selectedRoute.id }) }}>{text('沿此路线前进', 'Take this path')}</button>
            </> : run.phase === 'event' ? <ExpeditionEventChoices run={run} zh={zh} disabled={disabled} act={act} /> : run.phase === 'failed' ? <><div className={css.result} data-failed><ExpeditionIcon kind="fork" /><strong>RECONNECT</strong><p>{text('奖励已保存，队伍可从本战入场状态重新出发。', 'Rewards saved. Restore your squad to this battle’s entry state.')}</p></div><button type="button" className={css.primary} disabled={disabled} onClick={() => act({ type: 'expedition-retry', runId: run.id })}>{text('免费重试当前战斗', 'Retry this battle for free')}</button></> : run.phase === 'complete' ? <><div className={css.result}><ExpeditionIcon kind="crown" /><small>EXPEDITION COMPLETE</small><div className={css.loot}><span><ExpeditionIcon kind="shard" /><b>+{run.shards}</b></span><span><ExpeditionIcon kind="material" /><b>+{run.materials}</b></span></div><p>{boss ? text(`${creatureName(boss, zh)}已加入招募商店`, `${creatureName(boss, zh)} is now in the shop`) : text('首领招募已解锁', 'Boss recruitment unlocked')}</p></div><button type="button" className={css.primary} onClick={() => setView('recruit')}>{text('前往招募商店', 'Open recruitment shop')}</button></> : <>
              {boss ? <div className={css.reveal}><img src={contentAssetUrl(`creature:${boss.id}:sprite`)} alt={creatureName(boss, zh)} /><div><small>DECRYPTED / BOSS IDENTIFIED</small><b>{creatureName(boss, zh)}</b><span>{text('击败她，解锁永久招募', 'Defeat her to unlock recruitment')}</span><button className={css.link} type="button" onClick={() => inspectStage(run.stage)}>{text('查看战术情报', 'Tactical details')}</button></div></div> : <div className={css.encounter}><div className={css.enemyEmblem}><ExpeditionIcon kind={EXPEDITION_NODES[run.stage]!.icon} /><small>0{run.stage + 1}</small></div><div><small>{run.stage === EXPEDITION_FINAL_NODE ? 'BOSS ENCOUNTER' : 'NEXT ENCOUNTER'}</small><b>{run.stage === 0 ? text('四连破盾', 'Match four. Break guard.') : run.stage === 2 ? text('稳步前进，或挑战精英', 'Guard up, or brave the elite.') : run.stage === 4 ? text('换色破镜', 'Change color. Break the mirror.') : text('击破模块，关闭机制', 'Break modules. Disable effects.')}</b><button className={css.link} type="button" onClick={() => inspectStage(run.stage)}>{text('查看战术情报', 'Tactical details')}</button></div></div>}
              <div className={css.party}>{run.party.map(member => <span key={member.instanceId}><CreatureSprite creature={creatureById(member.creatureId)!} captured={member} size="small" /><b>{creatureName(creatureById(member.creatureId)!, zh)}</b><small><ExpeditionIcon kind="charge" />{member.energy}/12</small><i className={css.meter} style={meter(member.energy, 12)} /></span>)}</div>
              {run.phase === 'ready' && <button type="button" className={css.primary} disabled={disabled || !!state.battle} onClick={() => act({ type: 'expedition-continue', runId: run.id })}>{text('进入战斗', 'Enter battle')}</button>}
              {run.phase === 'battle' && <button type="button" className={css.primary} onClick={close}>{text('返回战斗', 'Return to battle')}</button>}
            </>}
            <div className={css.footer}><div className={css.perks}><small>{text('构筑', 'BUILD')} {run.perks.length}</small>{run.perks.map(id => { const perk = EXPEDITION_PERKS.find(item => item.id === id)!, name = zh ? perk.zh : perk.en; return <button type="button" key={id} title={name} aria-label={name} data-family={perk.family} onClick={() => setDetail({ title: name, body: zh ? perk.descZh : perk.descEn })}><ExpeditionIcon kind={PERK_VISUALS[id].icon} /></button> })}<button type="button" className={css.stock} aria-label={text('支援库存', 'Support stock')} onClick={() => setDetail({ title: text('支援库存', 'Support stock'), body: EXPEDITION_SUPPORTS.map(kind => `${supportName(kind, zh)} ×${run.supplies[kind]} — ${supportHint(kind, zh)}`).join('\n\n') })}><ExpeditionIcon kind="material" />{Object.values(run.supplies).reduce((sum, n) => sum + n, 0)}</button></div>
            <button type="button" className={css.leave} disabled={busy} aria-label={run.phase === 'complete' ? text('完成 · 返回事件', 'Done · Back to discoveries') : text('结束本次探索', 'End this expedition')} onClick={() => run.phase === 'complete' ? act({ type: 'expedition-leave', runId: run.id }) : setView('leave')}>{run.phase === 'complete' ? text('完成', 'Done') : text('退出', 'End run')}</button></div>
          </>)}
        </div>
      </div>
    </PanelDialog>}
    {detail && <PanelDialog title={detail.title} closeLabel={text('关闭', 'Close')} onClose={() => setDetail(undefined)}><p style={{ whiteSpace: 'pre-line' }}>{detail.body}</p></PanelDialog>}
  </div>
}
