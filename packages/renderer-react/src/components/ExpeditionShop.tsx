import { useEffect, useState } from 'react'
import { EXPEDITION_COST } from '../../../engine/src/expedition.ts'
import { EXPEDITION_SHOP_ITEMS } from '../../../engine/src/expedition-catalog.ts'
import type { ExpeditionShopItemId } from '../../../engine/src/expedition-catalog.ts'
import type { TraceWildAction, TraceWildState } from '../../../engine/src/types.ts'
import { contentAssetUrl, creatureById, skillByCreatureId } from '../content.ts'
import { creatureName } from './creature-presentation.tsx'
import { PanelDialog, PageControls } from './PanelDialog.tsx'
import { ExpeditionIcon } from './ExpeditionGraphics.tsx'
import css from './expedition.module.css'

/** Boss identities enter this view only through the persisted clear list. */
export function ExpeditionShop({ state, zh, busy, act }: { state: TraceWildState; zh: boolean; busy: boolean; act: (action: TraceWildAction) => void }) {
  const [tab, setTab] = useState<'boss' | 'xp'>('boss')
  const [page, setPage] = useState(0)
  const [detail, setDetail] = useState(false)
  const [purchase, setPurchase] = useState<{ itemId: ExpeditionShopItemId; count: number; id: string }>()
  const [notice, setNotice] = useState('')
  const t = (cn: string, en: string) => zh ? cn : en
  const data = state.expedition
  const ids = data?.unlockedBosses ?? []
  const id = ids[Math.min(page, Math.max(0, ids.length - 1))]
  const boss = id ? creatureById(id) : undefined
  const skill = boss ? skillByCreatureId(boss.id) : undefined
  const item = EXPEDITION_SHOP_ITEMS.find(item => item.id === purchase?.itemId)
  const locked = busy || !state.enabled || !!state.battle || !!data?.run && data.run.phase !== 'complete'
  const shards = data?.shards ?? 0
  const cost = (item?.cost ?? 0) * (purchase?.count ?? 0)
  useEffect(() => {
    if (purchase && data?.shopReceipts?.includes(purchase.id)) {
      setNotice(zh ? `已兑换 ${purchase.count} 份经验芯片，可在码灵升级中使用。` : `${purchase.count} XP chips received. Use them in creature upgrades.`)
      setPurchase(undefined)
    }
  }, [purchase, data?.shopReceipts, zh])
  return <div className={css.shop}>
    <div className={css.shopBalance}><span><ExpeditionIcon kind="shard" />{t('异常碎片', 'Anomaly shards')}</span><strong>{shards.toLocaleString()}</strong></div>
    <div className={css.tabs} aria-label={t('商品分类', 'Shop categories')}>
      <button type="button" aria-pressed={tab === 'boss'} onClick={() => { setTab('boss'); setNotice('') }}>{t('码灵', 'Codekins')} · {ids.length}</button>
      <button type="button" aria-pressed={tab === 'xp'} onClick={() => { setTab('xp'); setNotice('') }}>{t('经验道具', 'XP items')}</button>
    </div>
    {tab === 'boss' ? boss && id ? <>
      <div className={css.hero}><img src={contentAssetUrl(`creature:${boss.id}:sprite`)} alt={creatureName(boss, zh)} /><div><small>CLEAR / RECRUIT</small><h3>{creatureName(boss, zh)}</h3><span className={css.tag}>{t('已通关 · 永久解锁', 'CLEARED / PERMANENT')}</span><p>{t('棱镜品质 · 等级 1', 'Prism quality · Level 1')}</p></div></div>
      <button type="button" className={css.link} onClick={() => setDetail(true)}>{t('查看伙伴技能', 'View companion skills')}</button>
      <PageControls page={Math.min(page, ids.length - 1)} pages={ids.length} onChange={setPage} zh={zh} />
      <button type="button" className={css.primary} disabled={locked || data?.recruitedBosses.includes(id) || shards < EXPEDITION_COST || state.creatures.length >= 240} onClick={() => act({ type: 'expedition-recruit', bossId: id })}>{data?.recruitedBosses.includes(id) ? t('已招募', 'Recruited') : t(`招募 · ${EXPEDITION_COST} 碎片`, `Recruit · ${EXPEDITION_COST} shards`)}</button>
      {state.creatures.length >= 240 && <small>{t('码灵容量已满，请先整理收藏。', 'Collection full. Make room before recruiting.')}</small>}
    </> : <div className={css.shopEmpty}><ExpeditionIcon kind="unknown" /><h3>{t('等待相遇', 'An encounter awaits')}</h3><p>{t('击败探索终点的首领后，她会永久加入招募商店。', 'Defeat the Boss at an expedition’s endpoint to unlock her here permanently.')}</p><small>{t('未通关的首领身份保持未知。', 'Uncleared Boss identities remain unknown.')}</small></div> : <>
      <div className={css.xpItems}>{EXPEDITION_SHOP_ITEMS.map(item => <button type="button" key={item.id} data-quality={item.quality} disabled={locked} onClick={() => { setNotice(''); setPurchase({ itemId: item.id, count: 1, id: `shop_${crypto.randomUUID()}` }) }}>
        <ExpeditionIcon kind="material" /><span><b>{zh ? item.zh : item.en}</b><small>+{item.xp} XP · {t('持有', 'Owned')} {state.materials[item.quality]}</small></span><strong>{item.cost}<small>{t('碎片', 'shards')}</small></strong>
      </button>)}</div><small>{t('兑换后进入升级素材库存，打开码灵详情中的「码灵养成」使用。', 'Added to growth materials. Open a creature’s details → Codekin growth to use.')}</small>
    </>}
    {locked && !busy && <small>{t('结束当前战斗或探索后可兑换。', 'Finish the current battle or expedition to exchange.')}</small>}
    {notice && <p role="status" className={css.choiceDetail}>{notice}</p>}
    {detail && boss && skill && <PanelDialog title={creatureName(boss, zh)} closeLabel={t('关闭', 'Close')} onClose={() => setDetail(false)}><div className={css.panel}><b>{zh ? skill.passiveNameZh : skill.passiveNameEn}</b><p>{zh ? skill.passiveDescriptionZh : skill.passiveDescriptionEn}</p><b>{zh ? skill.activeNameZh : skill.activeNameEn} · {skill.energyCost}</b><p>{zh ? skill.activeDescriptionZh : skill.activeDescriptionEn}</p></div></PanelDialog>}
    {purchase && item && <PanelDialog title={zh ? item.zh : item.en} closeLabel={t('取消', 'Cancel')} onClose={() => setPurchase(undefined)}><div className={css.panel}>
      <div className={css.quantity}><button type="button" aria-label={t('减少数量', 'Decrease quantity')} disabled={busy || purchase.count <= 1} onClick={() => setPurchase({ ...purchase, count: purchase.count - 1 })}>−</button><label>{t('兑换数量', 'Quantity')}<input aria-label={t('兑换数量', 'Quantity')} type="number" min={1} max={99} value={purchase.count} disabled={busy} onChange={event => setPurchase({ ...purchase, count: Math.max(1, Math.min(99, Math.trunc(Number(event.target.value) || 1))) })} /></label><button type="button" aria-label={t('增加数量', 'Increase quantity')} disabled={busy || purchase.count >= 99} onClick={() => setPurchase({ ...purchase, count: purchase.count + 1 })}>＋</button></div>
      <div className={css.choiceDetail}><b>+{item.xp * purchase.count} XP</b><p>{t(`消耗 ${cost} 碎片 · 当前持有 ${shards}`, `Cost ${cost} shards · Balance ${shards}`)}</p><small>{t('道具存入库存，不会自动使用。', 'Items go to inventory; they are not consumed automatically.')}</small></div>
      <button type="button" className={css.primary} disabled={locked || shards < cost || state.materials[item.quality] + purchase.count > 9999} onClick={() => act({ type: 'expedition-shop-buy', itemId: item.id, count: purchase.count, purchaseId: purchase.id })}>{shards < cost ? t('碎片不足', 'Insufficient shards') : state.materials[item.quality] + purchase.count > 9999 ? t('素材库存已满', 'Material inventory full') : t(`确认兑换 · ${cost} 碎片`, `Confirm exchange · ${cost} shards`)}</button>
    </div></PanelDialog>}
  </div>
}
