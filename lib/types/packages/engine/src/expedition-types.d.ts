import type { BattlePartyMember, BattleState, TraceEcology } from './types.ts';
import type { ExpeditionBossId } from './expedition-catalog.ts';
export type ExpeditionPerk = 'relay-cache' | 'four-beacon' | 'blast-loop' | 'shield-heat' | 'reserve-barrier' | 'purify-wave' | 'star-trace' | 'backflow' | 'cooling' | 'quick-boot' | 'last-reserve' | 'module-piercer' | 'prism-pulse' | 'shared-current' | 'steady-flow';
export type ExpeditionSupport = 'shuffle' | 'cleanse' | 'burst';
export type ExpeditionNodeChoice = 'cache-repair' | 'cache-charge' | 'cache-salvage' | 'workshop-install' | 'workshop-reforge' | 'workshop-stock' | 'camp-repair' | 'camp-beacon' | 'camp-sabotage';
export type ExpeditionSupplies = Record<ExpeditionSupport, number>;
export type ExpeditionTarget = 'core' | 'shield' | 'interference';
export interface ExpeditionCombat {
    stage: number;
    perks: ExpeditionPerk[];
    target: ExpeditionTarget;
    shieldHp: number;
    interferenceHp: number;
    moduleMaxHp: number;
    mirror?: TraceEcology;
    lastEcology?: TraceEcology;
    roundDamage: Partial<Record<TraceEcology, number>>;
    relayUsed: string[];
    overflowUsed: string[];
    heat: number;
    supportUsed: boolean;
    emergencyUsed: boolean;
    overdrive: boolean;
    elite: boolean;
}
export interface ExpeditionEvent {
    id: string;
    source: 'collaboration' | 'activity';
    seed: number;
    discoveredAt: number;
    tutorial: boolean;
}
export interface ExpeditionRun {
    id: string;
    version: 2 | 3;
    /** Not populated until the last node. Version 2 runs retain their original Queen. */
    bossId?: ExpeditionBossId;
    content: string;
    event: ExpeditionEvent;
    phase: 'ready' | 'battle' | 'upgrade' | 'route' | 'event' | 'failed' | 'complete';
    stage: number;
    rng: number;
    party: BattlePartyMember[];
    hp: number;
    maxHp: number;
    perks: ExpeditionPerk[];
    offers: ExpeditionPerk[];
    route?: 'repair' | 'beacon' | 'safe-bridge' | 'unstable-bridge';
    finalPlan?: 'repair' | 'beacon' | 'sabotage';
    completed: number[];
    choices: Partial<Record<number, string>>;
    supplies: ExpeditionSupplies;
    replacePerk?: ExpeditionPerk;
    rewards: number[];
    shards: number;
    materials: number;
    checkpoint?: BattleState;
    checkpointRng?: number;
    checkpointSupplies?: ExpeditionSupplies;
}
export interface ExpeditionState {
    version: 2;
    clues: number;
    watermark: number;
    tutorialDiscovered: boolean;
    events: ExpeditionEvent[];
    shards: number;
    clears: number;
    recruited: boolean;
    unlockedBosses: ExpeditionBossId[];
    recruitedBosses: ExpeditionBossId[];
    shopReceipts: string[];
    run?: ExpeditionRun;
    recoveryNotice?: boolean;
}
//# sourceMappingURL=expedition-types.d.ts.map