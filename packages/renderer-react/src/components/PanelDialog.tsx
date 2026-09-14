import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDialogAccessibility } from './dialog-accessibility.ts'
import css, { styleText } from './panel-dialog.module.css'

interface DialogScope {
  host: HTMLDivElement | null
  register: (layer: HTMLDivElement) => () => void
}

const DialogContext = createContext<DialogScope | null>(null)

/** Keep modal geometry and inert content inside the movable plugin window. */
export function PanelDialogScope({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const background = useRef<HTMLDivElement>(null)
  const layers = useRef<HTMLDivElement[]>([])
  const register = useCallback((layer: HTMLDivElement) => {
    const sync = () => {
      if (background.current !== null) background.current.inert = layers.current.length > 0
      for (const entry of layers.current) entry.inert = entry !== layers.current.at(-1)
    }
    layers.current.push(layer)
    sync()
    return () => {
      layers.current = layers.current.filter(entry => entry !== layer)
      sync()
    }
  }, [])
  const scope = useMemo(() => ({ host, register }), [host, register])
  return <DialogContext.Provider value={scope}>
    <style data-plugin-css="codekin-panel-dialog">{styleText}</style>
    <div ref={background} className={css.background} data-panel-dialog-background>{children}</div>
    <div ref={setHost} className={css.host} data-panel-dialog-host />
  </DialogContext.Provider>
}

interface PanelDialogProps {
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  id?: string
  restoreFocusTo?: HTMLElement | null | undefined
}

export function PanelDialog(props: PanelDialogProps) {
  const scope = useContext(DialogContext)
  if (scope?.host == null) return null
  return createPortal(<DialogContent {...props} register={scope.register} />, scope.host)
}

function DialogContent(props: PanelDialogProps & Pick<DialogScope, 'register'>) {
  const titleId = useId()
  const layer = useRef<HTMLDivElement>(null)
  const dialog = useDialogAccessibility<HTMLDivElement>(props.onClose, false, props.restoreFocusTo)
  useLayoutEffect(() => props.register(layer.current!), [props.register])
  return <div ref={layer} className={css.backdrop} data-panel-dialog-backdrop
    onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) props.onClose() }}>
    <div ref={dialog.dialogRef} id={props.id} className={css.dialog} data-panel-dialog role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
      onKeyDown={event => { dialog.onDialogKeyDown(event); event.stopPropagation() }}>
      <header className={css.heading}><h2 id={titleId}>{props.title}</h2>
        <button type="button" onClick={props.onClose} aria-label={props.closeLabel} data-dialog-initial-focus>×</button></header>
      <div className={css.body} data-panel-dialog-body>{props.children}</div>
    </div>
  </div>
}

export function PageControls(props: { page: number; pages: number; onChange: (page: number) => void; zh: boolean }) {
  if (props.pages <= 1) return null
  return <nav className={css.pages} aria-label={props.zh ? '翻页' : 'Pagination'}>
    <style data-plugin-css="codekin-pagination">{styleText}</style>
    <button type="button" disabled={props.page <= 0} onClick={() => props.onChange(props.page - 1)}>{props.zh ? '上一页' : 'Previous'}</button>
    <span aria-live="polite">{props.page + 1} / {props.pages}</span>
    <button type="button" disabled={props.page >= props.pages - 1} onClick={() => props.onChange(props.page + 1)}>{props.zh ? '下一页' : 'Next'}</button>
  </nav>
}

export function usePagination<T>(items: readonly T[], size: number, resetKey = '') {
  const [requested, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(items.length / size))
  const page = Math.min(requested, pages - 1)
  useEffect(() => { setPage(0) }, [resetKey, size])
  return { page, pages, onChange: setPage, items: items.slice(page * size, (page + 1) * size) }
}

export function StoryPages(props: { body: string; zh: boolean }) {
  const chunks = props.body.match(new RegExp(`[\\s\\S]{1,${props.zh ? 360 : 750}}(?:[。！？.!?]\\s*|\\s+|$)|[\\s\\S]{1,${props.zh ? 360 : 750}}`, 'g')) ?? [props.body]
  const paging = usePagination(chunks, 1, props.body)
  return <div className={css.reading}>
    {paging.items[0]?.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    <PageControls {...paging} zh={props.zh} />
  </div>
}
