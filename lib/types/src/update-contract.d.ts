/** Public, browser-safe update information. Never includes paths or save data. */
export interface CodekinUpdateReport {
    format: 'codekin-updates-v1';
    installedVersion: string | null;
    dshVersion: string | null;
    dshWebVersion: string | null;
    supportedDsh: string | null;
    compatible: boolean | null;
    status: 'idle' | 'checking' | 'ok' | 'unavailable' | 'host-unknown';
    latestCompatibleVersion: string | null;
    updateAvailable: boolean;
    checkedAt: number | null;
}
export declare const CODEKIN_PACKAGE = "@nath-vikky/dsh-codekin";
export declare const CODEKIN_REPOSITORY = "https://github.com/Nath-Vikky/dsh-codekin";
export declare const CODEKIN_DOWNLOADS = "https://www.npmjs.com/package/@nath-vikky/dsh-codekin?activeTab=versions";
export declare const CODEKIN_UPDATE_HELP = "https://github.com/Nath-Vikky/dsh-codekin/releases";
export declare function codekinVersionUrl(version: string | null): string;
//# sourceMappingURL=update-contract.d.ts.map