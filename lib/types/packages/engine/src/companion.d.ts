import type { CapturedCreature, CompanionLounge, CreatureBond, TraceWildState } from './types.ts';
export declare const COMPANION_STORY_THRESHOLDS: readonly [5, 20, 50];
export declare const COMPANION_BOND_LIMIT = 50;
export declare const COMPANION_INTERACTION_POINTS = 5;
export declare const COMPANION_INTERACTION_INTERVAL: number;
export declare function selectedCompanion(state: TraceWildState): CapturedCreature | undefined;
export declare function companionBond(state: TraceWildState, instanceId: string): CreatureBond;
export declare function companionInteractionReady(bond: CreatureBond, now: number): boolean;
export declare function companionStoryUnlocked(points: number, chapter: number): boolean;
export declare function restoreCompanionLounge(value: unknown, creatures: readonly CapturedCreature[], now: number): CompanionLounge | undefined;
//# sourceMappingURL=companion.d.ts.map