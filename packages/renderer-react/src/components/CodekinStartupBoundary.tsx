import { Component, useState } from 'react'
import type { ReactNode } from 'react'
import { CodekinUpdateInfo } from './CodekinUpdateDialog.tsx'
import { useCodekinUpdates } from './use-codekin-updates.ts'
import { useUiPreferences } from './use-ui-preferences.ts'
import { useDialogAccessibility } from './dialog-accessibility.ts'
import css, { styleText } from './codekin-updates.module.css'

function StartupHelp({ retry, zh: hostZh }: { retry: () => void; zh: boolean }) {
  const updates = useCodekinUpdates()
  const { preferences } = useUiPreferences()
  const zh = preferences.language === 'zh' || preferences.language !== 'en' && hostZh
  const [dismissed, setDismissed] = useState(false)
  const dialog = useDialogAccessibility(() => { setDismissed(true) })
  return <>
    <style data-plugin-css="codekin-startup-help">{styleText}</style>
    {dismissed ? <button className={css.reopen} onClick={() => { setDismissed(false) }}>CODEKIN · {zh ? '启动帮助' : 'Startup help'}</button>
      : <section className={css.boundary} ref={dialog.dialogRef} onKeyDown={dialog.onDialogKeyDown} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="codekin-startup-title">
        <button className={css.boundaryClose} onClick={() => { setDismissed(true) }} aria-label={zh ? '关闭' : 'Close'} data-dialog-initial-focus>×</button>
        <h2 id="codekin-startup-title">CODEKIN · {zh ? '启动帮助' : 'Startup help'}</h2>
        <CodekinUpdateInfo updates={updates} zh={zh} problem />
        <div className={css.actions}><button type="button" onClick={retry}>{zh ? '重新打开码灵' : 'Reopen Codekin'}</button></div>
      </section>}
  </>
}

/** A renderer failure must leave a small, independent route to compatible downloads. */
export class CodekinStartupBoundary extends Component<{ children: ReactNode; zh: boolean }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  override render() {
    return this.state.failed ? <StartupHelp zh={this.props.zh} retry={() => { this.setState({ failed: false }) }} /> : this.props.children
  }
}
