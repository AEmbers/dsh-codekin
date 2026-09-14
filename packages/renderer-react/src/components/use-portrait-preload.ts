import { useEffect } from 'react'
import { decodeCreatureImage } from '../appearance-presentation.ts'

/** Prepare a bounded set of likely next images, sequentially after the first paint. */
export function usePortraitPreload(sources: readonly (string | undefined)[], enabled: boolean): void {
  const key = JSON.stringify([...new Set(sources.filter((source): source is string => source !== undefined))].slice(0, 8))
  useEffect(() => {
    if (!enabled) return
    let canceled = false
    let running = false
    const prepare = async () => {
      if (running || canceled || document.hidden) return
      running = true
      for (const source of JSON.parse(key) as string[]) {
        if (canceled || document.hidden) break
        await decodeCreatureImage(source, 'low')
      }
      running = false
    }
    const onVisible = () => { void prepare() }
    const timer = window.setTimeout(onVisible, 150)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      canceled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [key, enabled])
}
