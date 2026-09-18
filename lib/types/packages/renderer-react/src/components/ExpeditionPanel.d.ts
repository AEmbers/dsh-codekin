import type { TraceWildAction, TraceWildState, BattleState } from '../../../engine/src/types.ts';
import type { ExpeditionSupplies } from '../../../engine/src/expedition-types.ts';
export declare const expeditionStageName: (stage: number, zh: boolean) => "" | "链路守卫" | "Link Guardian" | "补给残响" | "Supply Echo" | "精英岔路" | "Elite Crossing" | "重编工坊" | "Recompile Forge" | "镜像核心" | "Mirror Core" | "终局整备" | "Final Camp" | "未知终点" | "Unknown Endpoint";
export declare const expeditionStageHint: (stage: number, zh: boolean) => string;
export declare function ExpeditionCombatPanel({ battle, runId, supplies, zh, busy, act, reducedMotion }: {
    battle: BattleState;
    runId: string;
    supplies?: ExpeditionSupplies | undefined;
    zh: boolean;
    busy: boolean;
    act: (action: TraceWildAction) => void;
    reducedMotion?: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function ExpeditionPanel({ state, zh, busy, act, reducedMotion }: {
    state: TraceWildState;
    zh: boolean;
    busy: boolean;
    act: (action: TraceWildAction) => void;
    reducedMotion?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ExpeditionPanel.d.ts.map