import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import type { CodekinContentView } from '../../content-sdk/src/view.ts';
import type { TraceWildService } from './service.ts';
import type { CodekinUpdateChecker } from './updates.ts';
export declare const TRACEWILD_API_PREFIX = "/api/tracewild";
export interface TraceWildRouteGroup {
    readonly routes: readonly WebRoute[];
    close(): void;
}
/** Kept independent of the game service so startup failures can still show help. */
export declare function createCodekinUpdateRoutes(checker: CodekinUpdateChecker): TraceWildRouteGroup;
export declare function createTraceWildRoutes(service: TraceWildService, assetDirectory: string, content: CodekinContentView): TraceWildRouteGroup;
//# sourceMappingURL=routes.d.ts.map