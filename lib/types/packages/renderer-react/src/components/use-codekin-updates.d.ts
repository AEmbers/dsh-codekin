import type { CodekinUpdateReport } from '../../../../src/update-contract.ts';
export declare function parseUpdateReport(value: unknown): CodekinUpdateReport;
export declare function useCodekinUpdates(): {
    report: CodekinUpdateReport | undefined;
    busy: boolean;
    unavailable: boolean;
    refresh: (manual?: boolean) => Promise<void>;
};
export type CodekinUpdates = ReturnType<typeof useCodekinUpdates>;
//# sourceMappingURL=use-codekin-updates.d.ts.map