import { memo, useState } from 'react'
import type {
  CaptureCoreQuality,
  CreatureDefinition,
  CreatureAppearance,
  TraceEcology,
} from '../../../engine/src/types.ts'
import { isCreatureImageReady, resolveCreatureSprite, type CreatureLook } from '../appearance-presentation.ts'
import type { TraceWildLocaleKey } from '../locales.ts'
import css from './tracewild.module.css'

export const ECOLOGY_KEYS: Record<TraceEcology, TraceWildLocaleKey> = {
  lumen: 'ecologyLumen', forge: 'ecologyForge', relay: 'ecologyRelay',
  aegis: 'ecologyAegis', glitch: 'ecologyGlitch',
}

export const CORE_KEYS: Record<CaptureCoreQuality, TraceWildLocaleKey> = {
  pebble: 'corePebble', pulse: 'corePulse', prism: 'corePrism', nova: 'coreNova', origin: 'coreOrigin',
}

export const RARITY_KEYS = {
  common: 'rarityCommon', uncommon: 'rarityUncommon', rare: 'rarityRare', apex: 'rarityApex',
} as const

export const CreatureSprite = memo(function CreatureSprite(props: {
  creature: CreatureDefinition
  size?: 'tiny' | 'small' | 'medium' | 'large'
  unknown?: boolean
  eager?: boolean
  priority?: 'high' | 'auto'
  captured?: CreatureLook | undefined
  level?: number | undefined
  appearance?: CreatureAppearance | undefined
  silhouetteMask?: string | undefined
}) {
  const [failedSources, setFailedSources] = useState<ReadonlySet<string>>(() => new Set())
  const [retriedSources, setRetriedSources] = useState<ReadonlySet<string>>(() => new Set())
  const [loadedSource, setLoadedSource] = useState<string>()
  const look = props.captured ?? { level: props.level ?? 1, ...(props.appearance === undefined ? {} : { appearance: props.appearance }) }
  const resolved = resolveCreatureSprite(props.creature.id, look)
  const source = resolved.source !== undefined && !failedSources.has(resolved.source) ? resolved.source
    : resolved.fallback !== undefined && !failedSources.has(resolved.fallback) ? resolved.fallback : undefined
  const className = `${css.sprite} ${css[`sprite_${props.size ?? 'medium'}`]} ${props.unknown ? css.spriteUnknown : ''}`
  if (props.unknown) {
    return <span className={`${className} ${css.spritePlaceholder}`} aria-hidden="true">?</span>
  }
  if (source === undefined) {
    return <span className={`${className} ${css.spritePlaceholder}`} data-sprite-status="error" aria-hidden="true">?</span>
  }
  // A new URL permits one network retry instead of reusing a failed browser request.
  const requestSource = retriedSources.has(source) ? `${source}${source.includes('?') ? '&' : '?'}retry=1` : source
  const loaded = loadedSource === requestSource || isCreatureImageReady(requestSource)
  return (
    <img
      key={requestSource}
      className={`${className} ${!loaded && props.silhouetteMask === undefined ? css.spriteLoading : ''}`}
      src={requestSource}
      style={props.silhouetteMask !== undefined && source === resolved.source ? { maskImage: `url("${props.silhouetteMask}")`, maskSize: '100% 100%' } : undefined}
      data-creature-id={props.creature.id}
      data-creature-instance={look.instanceId}
      data-creature-appearance={source === resolved.source ? resolved.appearance : 'original'}
      data-creature-level={look.level}
      data-sprite-status={loaded ? 'ready' : 'loading'}
      alt=""
      width={384}
      height={384}
      loading={props.eager === false ? 'lazy' : 'eager'}
      {...{ fetchpriority: props.priority ?? 'auto' }}
      decoding="async"
      draggable={false}
      onLoad={() => { setLoadedSource(requestSource) }}
      onError={() => {
        if (!retriedSources.has(source)) setRetriedSources(previous => new Set([...previous, source]))
        else setFailedSources(previous => new Set([...previous, source]))
      }}
    />
  )
})

export function creatureName(creature: CreatureDefinition, zh: boolean): string {
  return zh ? creature.nameZh : creature.nameEn
}
