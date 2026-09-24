import { useCallback, useEffect, useRef, useState } from 'react'
import type { CodekinUpdateReport } from '../../../../src/update-contract.ts'

const STATUSES = ['idle', 'checking', 'ok', 'unavailable', 'host-unknown']
export function parseUpdateReport(value: unknown): CodekinUpdateReport {
  if (!value || typeof value !== 'object') throw new TypeError('Invalid update status')
  const row = value as CodekinUpdateReport
  if (row.format !== 'codekin-updates-v1' || !STATUSES.includes(row.status)
    || ![true, false, null].includes(row.compatible) || typeof row.updateAvailable !== 'boolean'
    || !['installedVersion', 'dshVersion', 'dshWebVersion', 'supportedDsh', 'latestCompatibleVersion'].every(key => {
      const field = row[key as keyof CodekinUpdateReport]
      return field === null || typeof field === 'string' && field.length > 0 && field.length < 512
    }) || row.checkedAt !== null && (!Number.isSafeInteger(row.checkedAt) || row.checkedAt < 0)) throw new TypeError('Invalid update status')
  return row
}

export function useCodekinUpdates() {
  const [report, setReport] = useState<CodekinUpdateReport>()
  const [busy, setBusy] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const active = useRef<AbortController>()
  const refresh = useCallback(async (manual = false) => {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    setBusy(true)
    try {
      for (let attempt = 0; attempt < 11; attempt++) {
        const response = await fetch(`/api/tracewild/updates${manual && attempt === 0 ? '?refresh=1' : ''}`, {
          credentials: 'same-origin', cache: 'no-store',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
        })
        if (!response.ok) throw new Error('Update service unavailable')
        const next = parseUpdateReport(await response.json())
        if (controller.signal.aborted) return
        setReport(next); setUnavailable(false)
        if (next.status !== 'checking') break
        await new Promise<void>(resolve => {
          const finish = () => { clearTimeout(timer); controller.signal.removeEventListener('abort', finish); resolve() }
          const timer = setTimeout(finish, 1000)
          controller.signal.addEventListener('abort', finish, { once: true })
        })
        if (controller.signal.aborted) return
      }
    } catch {
      if (!controller.signal.aborted) setUnavailable(true)
    } finally { if (!controller.signal.aborted) setBusy(false) }
  }, [])
  useEffect(() => {
    void refresh()
    // The Host caches registry metadata for six hours and coalesces all clients.
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 15 * 60_000)
    return () => { active.current?.abort(); clearInterval(timer) }
  }, [refresh])
  return { report, busy, unavailable, refresh }
}
export type CodekinUpdates = ReturnType<typeof useCodekinUpdates>
