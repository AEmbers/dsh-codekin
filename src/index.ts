/** Codekin Host plugin. */
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import type { Session, SessionEvent, SessionStore } from '@deepseek-ai/dsh-session'
import { CORE_CODEKIN_RUNTIME, CORE_CONTENT_VIEW } from './core-runtime.ts'
import { createCodekinUpdateRoutes, createTraceWildRoutes } from '../packages/dsh-adapter/src/routes.ts'
import { TraceWildService } from '../packages/dsh-adapter/src/service.ts'
import { CodekinUpdateChecker, detectCodekinRuntime } from '../packages/dsh-adapter/src/updates.ts'

export * from './core-runtime.ts'
export { TraceWildService } from '../packages/dsh-adapter/src/service.ts'

export const name = 'dsh-codekin'
export const inject = ['sessions', 'webServer']

// Local declarations keep development links and a normally installed package
// on the same public Cordis contract. The official service packages declare
// identical members when they resolve through one dependency tree.
declare module '@deepseek-ai/cordis' {
  interface Context {
    webServer: WebServer
    sessions: SessionStore
  }
  interface Events {
    'session/event'(session: Session, event: SessionEvent): void
    'session/disposed'(session: Session): void
  }
}

export function apply(ctx: Context): void {
  const checker = new CodekinUpdateChecker(detectCodekinRuntime())
  ctx.effect(() => {
    const updates = createCodekinUpdateRoutes(checker)
    let unregister: (() => void) | undefined
    try { unregister = ctx.webServer.register(updates.routes[0]!) }
    catch (error) { updates.close(); throw error }
    return () => { updates.close(); unregister?.() }
  }, 'codekin: version guidance')
  if (checker.snapshot().compatible === false) {
    ctx.logger.warn('Codekin is incompatible with this DSH runtime; update guidance remains available.')
    return
  }
  let service: TraceWildService
  try { service = new TraceWildService(ctx, { runtime: CORE_CODEKIN_RUNTIME }) }
  catch {
    ctx.logger.warn('Codekin could not start; update guidance remains available.')
    return
  }
  const assetDirectory = fileURLToPath(new URL('../assets/creatures/', import.meta.url))

  ctx.effect(() => {
    const routeGroup = createTraceWildRoutes(service, assetDirectory, CORE_CONTENT_VIEW)
    const disposers: (() => void)[] = []
    try {
      for (const route of routeGroup.routes) {
        disposers.push(ctx.webServer.register(route))
      }
      disposers.push(ctx.on('session/event', (session: Session, event: SessionEvent) => {
        service.observe(session, event)
      }))
      disposers.push(ctx.on('session/disposed', (session: Session) => {
        service.disposeSession(session)
      }))
    } catch (error) {
      routeGroup.close()
      for (const dispose of disposers.reverse()) {
        try { dispose() } catch { /* best-effort startup rollback */ }
      }
      throw error
    }
    return () => {
      // End long-lived responses before unregistering their route handlers so
      // EventSource reconnects can only attach to the next Cordis instance.
      routeGroup.close()
      for (const dispose of disposers.reverse()) {
        try { dispose() } catch { /* best-effort plugin teardown */ }
      }
    }
  }, 'tracewild: events and web routes')
}
