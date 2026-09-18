import { createHash } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import type { CodekinContentView } from '../packages/content-sdk/src/view.ts'
import type { TraceWildService } from '../packages/dsh-adapter/src/service.ts'
import { createTraceWildRoutes, TRACEWILD_API_PREFIX } from '../packages/dsh-adapter/src/routes.ts'
import { activateCodekinContent, contentAssetUrl } from '../packages/renderer-react/src/content.ts'
import { CORE_CONTENT_VIEW } from '../src/core-runtime.ts'

const directories: string[] = []
afterEach(async () => {
  activateCodekinContent(CORE_CONTENT_VIEW)
  for (const directory of directories.splice(0)) {
    if (!resolve(directory).startsWith(resolve(join(tmpdir(), 'codekin-assets-')))) throw new Error('Unexpected test directory')
    await rm(directory, { recursive: true, force: true })
  }
})

function response() {
  const result = { status: 0, headers: {} as Record<string, string>, body: Buffer.alloc(0) }
  const res = {
    destroyed: false, writableEnded: false,
    writeHead(status: number, headers: Record<string, string>) { result.status = status; result.headers = headers },
    end(value?: string | Buffer) { result.body = value === undefined ? Buffer.alloc(0) : Buffer.from(value) },
  } as unknown as ServerResponse
  return { res, result }
}
function request(url: string, extra: Record<string, string> = {}) {
  return { method: 'GET', url, headers: { host: '127.0.0.1:53733', ...extra } } as IncomingMessage
}

describe('image cache revisions', () => {
  it('changes only the edited image URL under the same package version and pins immutable responses', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'codekin-assets-'))
    directories.push(directory)
    const queen = CORE_CONTENT_VIEW.assets.find(asset => asset.key === 'creature:relay-fork-queen:sprite')!
    const other = CORE_CONTENT_VIEW.assets.find(asset => asset.key === 'creature:lumen-indeximp:sprite')!
    const content: CodekinContentView = { ...CORE_CONTENT_VIEW, assets: [
      { ...queen, path: 'queen.webp' }, { ...other, path: 'other.webp' },
      ...CORE_CONTENT_VIEW.assets.filter(asset => asset.key !== queen.key && asset.key !== other.key),
    ] }
    await writeFile(join(directory, 'queen.webp'), 'approved queen one')
    await writeFile(join(directory, 'other.webp'), 'unchanged companion')
    const group = createTraceWildRoutes({} as TraceWildService, directory, content)
    const getView = async (routes: typeof group) => {
      const output = response()
      await routes.routes.find(route => route.path.endsWith('/content'))!.handler(request(`${TRACEWILD_API_PREFIX}/content`), output.res)
      expect(output.result.status).toBe(200)
      return JSON.parse(output.result.body.toString()) as CodekinContentView
    }
    const getAsset = async (routes: typeof group, path: string, extra?: Record<string, string>) => {
      const output = response()
      await routes.routes.find(route => route.path.endsWith('/assets'))!.handler(request(`${TRACEWILD_API_PREFIX}/assets/${path}`, extra), output.res)
      return output.result
    }
    const first = await getView(group)
    const firstQueen = first.assets.find(asset => asset.key === queen.key)!
    const hash = createHash('sha256').update('approved queen one').digest('hex')
    expect(firstQueen.path).toBe(`v/${hash}/queen.webp`)
    activateCodekinContent(first)
    const oldUrl = contentAssetUrl(queen.key)
    expect(oldUrl).toContain(firstQueen.path)
    const image = await getAsset(group, firstQueen.path)
    expect(image.body.toString()).toBe('approved queen one')
    expect(image.headers['cache-control']).toContain('immutable')
    expect(image.headers.etag).toBe(`"${hash}"`)
    const validated = await getAsset(group, firstQueen.path, { 'if-none-match': image.headers.etag! })
    expect(validated.status).toBe(304)
    expect(validated.body.length).toBe(0)
    expect((await getAsset(group, 'queen.webp')).headers['cache-control']).toBe('no-cache')
    await writeFile(join(directory, 'queen.webp'), 'approved queen two')
    // An in-flight route keeps its original bytes as long as it advertises that revision.
    expect((await getAsset(group, firstQueen.path)).body.toString()).toBe('approved queen one')
    const updated = createTraceWildRoutes({} as TraceWildService, directory, content)
    const second = await getView(updated)
    expect(second.id).toBe(first.id)
    expect(second.assets.find(asset => asset.key === other.key)!.path).toBe(first.assets.find(asset => asset.key === other.key)!.path)
    const secondQueen = second.assets.find(asset => asset.key === queen.key)!
    expect(secondQueen.path).not.toBe(firstQueen.path)
    activateCodekinContent(second)
    expect(contentAssetUrl(queen.key)).not.toBe(oldUrl)
    expect((await getAsset(updated, secondQueen.path)).body.toString()).toBe('approved queen two')
    expect((await getAsset(updated, firstQueen.path)).status).toBe(404)
    expect((await getAsset(updated, '../outside.webp')).status).toBe(404)
    expect((await getAsset(updated, content.assets[2]!.path)).status).toBe(404)
    group.close(); updated.close()
  })
})
