/** Display-only physics. These values never enter the authoritative game state. */
export interface MotionPoint {
    x: number;
    y: number;
}
export interface SpringState {
    position: MotionPoint;
    velocity: MotionPoint;
}
export declare function stepSpring(state: SpringState, target: MotionPoint, elapsed: number): SpringState;
export declare function projectRelease(position: MotionPoint, velocity: MotionPoint): MotionPoint;
export declare function boardNeighbour(index: number, key: string, size?: number): number;
export declare const CODEKIN_PAGES: readonly ["lounge", "map", "tower", "squad", "dex", "inventory"];
export type CodekinPage = typeof CODEKIN_PAGES[number];
export type CodekinLanguage = 'auto' | 'zh' | 'en';
export declare const UI_PREFERENCES_KEY = "codekin.ui.v1";
export declare const UI_PREFERENCES_CHANGED = "codekin:ui-preferences";
export interface UiPreferences {
    reducedMotion?: boolean;
    language?: CodekinLanguage;
    startPage?: CodekinPage | 'last';
    lastPage?: CodekinPage;
    particles?: boolean;
    encounterBadges?: boolean;
    lockPosition?: boolean;
    windowPosition?: MotionPoint;
    launcherPosition?: MotionPoint | undefined;
}
export declare function readUiPreferences(): UiPreferences;
export declare function saveUiPreferences(update: UiPreferences): boolean;
//# sourceMappingURL=motion.d.ts.map