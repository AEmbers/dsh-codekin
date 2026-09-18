import type { CSSProperties } from 'react'
import type { ExpeditionPerk } from '../../../engine/src/expedition-types.ts'
import { EXPEDITION_NODES } from '../../../engine/src/expedition.ts'
import css from './expedition.module.css'

export type ExpeditionGlyph = 'unknown' | 'fork' | 'shield' | 'mirror' | 'crown' | 'shard' | 'material' | 'charge' | 'burst' | 'repair' | 'beacon' | 'safe' | 'risk'
const paths: Record<ExpeditionGlyph, string> = {
  unknown: 'M10 10a6 6 0 1 1 10 4c-3 2-4 3-4 6M16 26v1M3 8V3h5M24 3h5v5M29 24v5h-5M8 29H3v-5',
  fork: 'M12 27V16M12 17 5 10V4M12 17 23 10V4M2 7l3-3 3 3M20 7l3-3 3 3',
  shield: 'M16 3 27 8v9c0 6-11 12-11 12S5 23 5 17V8ZM16 9v14M10 16h12',
  mirror: 'm16 2 11 14-11 14L5 16Zm0 6v16M9 16h14',
  crown: 'm4 9 7 5 5-10 5 10 7-5-4 16H8ZM8 29h16',
  shard: 'm18 2 8 10-11 18-9-12ZM18 2l-3 28M6 18l20-6',
  material: 'm16 3 11 6v14l-11 6-11-6V9Zm0 26V16L5 9m11 7 11-7M10 6l11 7',
  charge: 'm18 2-12 17h9l-1 11 12-17h-9Z',
  burst: 'm16 2 3 9 10-5-5 10 6 4-11 1-3 9-4-9-10-1 7-5-4-9 8 5Z',
  repair: 'M12 4h8v8h8v8h-8v8h-8v-8H4v-8h8Z',
  beacon: 'M16 18v12M10 30h12M16 12v1M10 8a9 9 0 0 0 0 13M22 8a9 9 0 0 1 0 13M5 3a16 16 0 0 0 0 23M27 3a16 16 0 0 1 0 23',
  safe: 'M2 24h28M5 24V8M27 24V8M5 10q11 16 22 0M11 18v6M21 18v6M2 28h28',
  risk: 'M2 24h10m8 0h10M5 24V8M27 24V8M5 10l8 8m7 0 7-8M16 3l-4 8h6l-3 10',
}

export function ExpeditionIcon({ kind, className }: { kind: ExpeditionGlyph; className?: string | undefined }) {
  return <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[kind]} /></svg>
}

export const PERK_VISUALS: Record<ExpeditionPerk, { icon: ExpeditionGlyph; value: string }> = {
  'relay-cache': { icon: 'fork', value: '+2' }, 'four-beacon': { icon: 'beacon', value: '4 → 2' },
  'blast-loop': { icon: 'burst', value: '+70%' }, 'shield-heat': { icon: 'burst', value: '+25%' },
  'reserve-barrier': { icon: 'shield', value: '12%' }, 'purify-wave': { icon: 'repair', value: '+2%' },
  'star-trace': { icon: 'mirror', value: '+1' }, 'backflow': { icon: 'charge', value: '+2' },
  cooling: { icon: 'repair', value: '+15%' },
  'quick-boot': { icon: 'charge', value: '+3' }, 'last-reserve': { icon: 'repair', value: '12%' },
  'module-piercer': { icon: 'burst', value: '+35%' }, 'prism-pulse': { icon: 'mirror', value: '+90%' },
  'shared-current': { icon: 'fork', value: '+1' }, 'steady-flow': { icon: 'shield', value: '+2%' },
}

/** Every marker is a real combat or interactive event, never a decorative stop. */
export function ExpeditionRouteMap({ stage, done, zh, onInspect, finalName }: { stage: number; done: readonly number[]; zh: boolean; onInspect: (stage: number) => void; finalName?: string | undefined }) {
  const points = [[40, 27], [133, 27], [227, 27], [320, 27], [320, 90], [180, 90], [40, 90]]
  const line = (count: number) => points.slice(0, count).map(point => point.join(',')).join(' ')
  return <div className={css.routeMap} aria-label={zh ? '探索路线' : 'Expedition route'}>
    <svg viewBox="0 0 360 130" preserveAspectRatio="none" className={css.routeLines} aria-hidden="true">
      <polyline points={line(7)} fill="none" stroke="#655080" strokeWidth="1.5" strokeDasharray="3 5" />
      {stage > 0 && <polyline points={line(stage + 1)} fill="none" stroke="#d5ff45" strokeWidth="2" className={css.routeTrace} />}
    </svg>
    {EXPEDITION_NODES.map((node, index) => <button type="button" key={index} className={css.routeNode} data-current={stage === index || undefined} data-done={done.includes(index) || undefined} data-node={index}
      style={{ '--order': index, left: `${points[index]![0]! / 3.6}%`, top: `${points[index]![1]! / 1.3}%` } as CSSProperties} onClick={() => onInspect(index)} aria-label={`${index + 1}. ${index === 6 && finalName ? finalName : zh ? node.zh : node.en} · ${zh ? '机制详情' : 'mechanics'}`} aria-current={stage === index ? 'step' : undefined}>
      <span><ExpeditionIcon kind={index === 6 && finalName ? 'crown' : node.icon} /><i>{done.includes(index) ? '✓' : `0${index + 1}`}</i></span><b>{index === 6 && finalName ? (zh ? '首领现身' : 'Boss revealed') : zh ? node.zh : node.en}</b>
    </button>)}
  </div>
}

export function RouteIllustration({ kind }: { kind: 'safe' | 'risk' | 'repair' | 'beacon' }) {
  return <svg className={css.routeArt} viewBox="0 0 180 88" fill="none" aria-hidden="true" focusable="false">
    <path d="M0 70 90 18 180 70 90 120Z" stroke="currentColor" opacity=".16" />
    <path d="m14 70 76-44 76 44M36 83l54-31 54 31M55 18l75 43M21 38l74 43" stroke="currentColor" opacity=".2" />
    {kind === 'safe' || kind === 'risk' ? <>
      <path d="m10 55 30-18 29 16-30 19ZM112 44l29-17 30 17-30 18Z" fill="#101936" stroke="currentColor" />
      <path d={kind === 'safe' ? 'm39 53 89-34 14 9-89 35Z' : 'm39 53 36-14 14 9-36 15ZM97 29l31-10 14 9-31 12Z'} fill="currentColor" opacity=".5" />
      <path d="M40 53V26M129 19V4M54 62V35M142 28V13M40 26q44 19 89-22M54 35q44 19 88-22" stroke="currentColor" strokeWidth="2" />
      {kind === 'risk' && <path d="m95 31-11 15h9l-8 15" stroke="#ff94b5" strokeWidth="3" />}
    </> : <>
      <path d="m51 56 39-23 39 23-39 23Z" fill="#101936" stroke="currentColor" strokeWidth="2" /><path d="M51 56v10l39 23 39-23V56M90 79v10" stroke="currentColor" />
      {kind === 'repair' ? <path d="M82 20h16v12h12v16H98v12H82V48H70V32h12Z" fill="currentColor" opacity=".8" /> : <><path d="M90 54V19M79 61l11-7 11 7M72 14q-16 17 0 32M108 14q16 17 0 32M61 5q-24 26 0 51M119 5q24 26 0 51" stroke="currentColor" strokeWidth="2" /><circle cx="90" cy="18" r="5" fill="currentColor" /></>}
    </>}
    <path d="M3 12h12M9 6v12M157 77h8m-4-4v8" stroke="currentColor" opacity=".5" />
  </svg>
}
