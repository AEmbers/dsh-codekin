import { useCallback, useEffect, useState } from 'react'
import { readUiPreferences, saveUiPreferences, UI_PREFERENCES_CHANGED, UI_PREFERENCES_KEY } from '../motion.ts'
import type { UiPreferences } from '../motion.ts'

export function useUiPreferences() {
  const [preferences, setPreferences] = useState(readUiPreferences)
  const [saved, setSaved] = useState(true)
  useEffect(() => {
    const refresh = () => { setPreferences(readUiPreferences()) }
    const storage = (event: StorageEvent) => { if (event.key === null || event.key === UI_PREFERENCES_KEY) refresh() }
    window.addEventListener(UI_PREFERENCES_CHANGED, refresh)
    window.addEventListener('storage', storage)
    return () => {
      window.removeEventListener(UI_PREFERENCES_CHANGED, refresh)
      window.removeEventListener('storage', storage)
    }
  }, [])
  const update = useCallback((value: UiPreferences) => {
    setPreferences(current => ({ ...current, ...value }))
    setSaved(saveUiPreferences(value))
  }, [])
  return { preferences, update, saved }
}
