/** Public, browser-safe update information. Never includes paths or save data. */
export interface CodekinUpdateReport {
  format: 'codekin-updates-v1'
  installedVersion: string | null
  dshVersion: string | null
  dshWebVersion: string | null
  supportedDsh: string | null
  compatible: boolean | null
  status: 'idle' | 'checking' | 'ok' | 'unavailable' | 'host-unknown'
  latestCompatibleVersion: string | null
  updateAvailable: boolean
  checkedAt: number | null
}

export const CODEKIN_PACKAGE = '@nath-vikky/dsh-codekin'
export const CODEKIN_REPOSITORY = 'https://github.com/Nath-Vikky/dsh-codekin'
export const CODEKIN_DOWNLOADS = 'https://www.npmjs.com/package/@nath-vikky/dsh-codekin?activeTab=versions'
export const CODEKIN_UPDATE_HELP = `${CODEKIN_REPOSITORY}/releases`

// All external destinations are constructed locally; registry-provided links are ignored.
export function codekinVersionUrl(version: string | null): string {
  return version && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)
    ? `https://www.npmjs.com/package/@nath-vikky/dsh-codekin/v/${encodeURIComponent(version)}` : CODEKIN_DOWNLOADS
}
