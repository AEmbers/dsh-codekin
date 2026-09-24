import type { CodekinUpdateReport } from '../../../src/update-contract.ts';
type Manifest = Record<string, unknown>;
export interface CodekinRuntimeInfo {
    manifest: Manifest;
    dshVersion: string | null;
    dshWebVersion: string | null;
}
/** Resolve app-boot from the running CLI, not a bundled SDK or the workspace's npm version. */
export declare function detectCodekinRuntime(entry?: string | undefined, plugin?: string): CodekinRuntimeInfo;
/** Match both the package declaration and every SDK peer, like DSH's loader. */
export declare function supportsDsh(manifest: Manifest, host: string): boolean;
export declare function newestCompatibleCodekin(metadata: unknown, host: string, installed: string | null): string | null;
export declare class CodekinUpdateChecker {
    private readonly fetcher;
    private readonly now;
    private report;
    private pending;
    private lastAttempt;
    private closed;
    private readonly controller;
    constructor(info: CodekinRuntimeInfo, fetcher?: typeof fetch, now?: () => number);
    snapshot(): CodekinUpdateReport;
    /** Coalesced, bounded metadata checks; no installer, shell, or game-state access. */
    check(manual?: boolean): Promise<void>;
    close(): void;
}
export {};
//# sourceMappingURL=updates.d.ts.map