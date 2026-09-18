import type { BattleState, RandomSource, TraceSignal, TraceWildState } from './types.ts';
import type { ExpeditionCombat, ExpeditionRun, ExpeditionState, ExpeditionSupplies } from './expedition-types.ts';
export declare const EXPEDITION_BOSS = "relay-fork-queen";
export declare const EXPEDITION_COST = 120;
export declare const EXPEDITION_CLUES = 6;
export declare const EXPEDITION_FINAL_NODE = 6;
export declare const EXPEDITION_REWARDS: readonly [4, 0, 6, 0, 8, 0, 12];
export declare const EXPEDITION_NODES: readonly [{
    readonly zh: "链路守卫";
    readonly en: "Link Guardian";
    readonly kind: "battle";
    readonly icon: "shield";
}, {
    readonly zh: "补给残响";
    readonly en: "Supply Echo";
    readonly kind: "event";
    readonly icon: "material";
}, {
    readonly zh: "精英岔路";
    readonly en: "Elite Crossing";
    readonly kind: "battle";
    readonly icon: "burst";
}, {
    readonly zh: "重编工坊";
    readonly en: "Recompile Forge";
    readonly kind: "event";
    readonly icon: "fork";
}, {
    readonly zh: "镜像核心";
    readonly en: "Mirror Core";
    readonly kind: "battle";
    readonly icon: "mirror";
}, {
    readonly zh: "终局整备";
    readonly en: "Final Camp";
    readonly kind: "event";
    readonly icon: "beacon";
}, {
    readonly zh: "未知终点";
    readonly en: "Unknown Endpoint";
    readonly kind: "battle";
    readonly icon: "unknown";
}];
export declare const EXPEDITION_ENEMIES: readonly ["relay-forktail", "", "aegis-veribud", "", "lumen-echocoil", "", "relay-fork-queen"];
export declare const EXPEDITION_SUPPORTS: readonly ["shuffle", "cleanse", "burst"];
export declare const emptySupplies: () => ExpeditionSupplies;
export declare const EXPEDITION_PERKS: readonly [{
    readonly id: "relay-cache";
    readonly zh: "接力缓存";
    readonly en: "Relay Cache";
    readonly descZh: "释放主动后，下一位队员获得 2 指令值。每队员每战一次。";
    readonly descEn: "Casting grants the next ally 2 command. Once per member per battle.";
    readonly family: "charge";
}, {
    readonly id: "four-beacon";
    readonly zh: "四连信标";
    readonly en: "Four Beacon";
    readonly descZh: "直接四连给指令值最低的队员补充 2 点。每次交换一次。";
    readonly descEn: "A direct four-match grants the lowest-charge ally 2 command. Once per swap.";
    readonly family: "charge";
}, {
    readonly id: "blast-loop";
    readonly zh: "爆破回路";
    readonly en: "Blast Circuit";
    readonly descZh: "同一消除步骤引爆至少 2 个特殊块，追加当前队员 70% 算力伤害。每次交换一次。";
    readonly descEn: "Triggering 2 special panels in a step adds 70% acting attack as damage. Once per swap.";
    readonly family: "burst";
}, {
    readonly id: "shield-heat";
    readonly zh: "破盾余热";
    readonly en: "Shield Heat";
    readonly descZh: "削减敌方防火墙后，下次伤害提高 25%；不叠加。";
    readonly descEn: "Eroding firewall boosts the next hit by 25%. Does not stack.";
    readonly family: "burst";
}, {
    readonly id: "reserve-barrier";
    readonly zh: "备用屏障";
    readonly en: "Reserve Barrier";
    readonly descZh: "每战入场获得 12% 共享运行值的防护。";
    readonly descEn: "Begin each battle with guard equal to 12% shared runtime.";
    readonly family: "guard";
}, {
    readonly id: "purify-wave";
    readonly zh: "净化余波";
    readonly en: "Purifying Wave";
    readonly descZh: "清除危险块后修复 2% 运行值，每次交换至多 6%；无法阻止致命伤害。";
    readonly descEn: "Clearing hazard panels repairs 2% runtime each, up to 6% per swap. Cannot revive.";
    readonly family: "guard";
}, {
    readonly id: "star-trace";
    readonly zh: "星标追迹";
    readonly en: "Star Trace";
    readonly descZh: "同一交换消除两种属性，施加 1 层标记；最多 3 层。";
    readonly descEn: "Matching two attributes in a swap adds 1 Mark, up to 3.";
    readonly family: "burst";
}, {
    readonly id: "backflow";
    readonly zh: "回流阀";
    readonly en: "Backflow Valve";
    readonly descZh: "队员充至满指令值，给最低指令值队友 2 点。每队员每战一次，不递归。";
    readonly descEn: "Reaching full command gives the lowest-charge ally 2. Once per member per battle; no recursion.";
    readonly family: "charge";
}, {
    readonly id: "cooling";
    readonly zh: "冷却管线";
    readonly en: "Cooling Line";
    readonly descZh: "完成战斗后修复 15% 共享运行值。";
    readonly descEn: "Repair 15% shared runtime after each victory.";
    readonly family: "guard";
}, {
    readonly id: "quick-boot";
    readonly zh: "快速启动";
    readonly en: "Quick Boot";
    readonly descZh: "每战入场时全队获得 3 指令值。";
    readonly descEn: "Each ally begins every battle with 3 extra command.";
    readonly family: "charge";
}, {
    readonly id: "last-reserve";
    readonly zh: "应急储备";
    readonly en: "Last Reserve";
    readonly descZh: "存活且运行值低于 35% 时，修复 12%。每战一次，不能复活。";
    readonly descEn: "While alive below 35% runtime, repair 12%. Once per battle; cannot revive.";
    readonly family: "guard";
}, {
    readonly id: "module-piercer";
    readonly zh: "模块穿刺";
    readonly en: "Module Piercer";
    readonly descZh: "攻击首领模块或有防护层的敌人时，伤害提高 35%。";
    readonly descEn: "Deal 35% more damage to Boss modules or enemies with a guard layer.";
    readonly family: "burst";
}, {
    readonly id: "prism-pulse";
    readonly zh: "棱镜脉冲";
    readonly en: "Prism Pulse";
    readonly descZh: "直接五连追加当前队员 90% 算力伤害。每次交换一次。";
    readonly descEn: "A direct five-match adds 90% acting attack as damage. Once per swap.";
    readonly family: "burst";
}, {
    readonly id: "shared-current";
    readonly zh: "异色电流";
    readonly en: "Shared Current";
    readonly descZh: "一次交换消除三种属性，全队获得 1 指令值。每次交换一次。";
    readonly descEn: "Match three attributes in one swap to grant every ally 1 command. Once per swap.";
    readonly family: "charge";
}, {
    readonly id: "steady-flow";
    readonly zh: "稳态循环";
    readonly en: "Steady Flow";
    readonly descZh: "直接四连修复 2% 共享运行值。每次交换一次，不能复活。";
    readonly descEn: "A direct four-match repairs 2% shared runtime. Once per swap; cannot revive.";
    readonly family: "guard";
}];
export declare function initialExpedition(): ExpeditionState;
/** The watermark prevents evicted signals, history replay and clock rollback minting discoveries. */
export declare function discoverExpedition(state: TraceWildState, signal: TraceSignal): void;
export declare function expeditionRandom(run: ExpeditionRun): RandomSource;
export declare function expeditionContentId(): string;
export declare function expeditionProfile(run: ExpeditionRun): {
    creatureId: "" | "relay-fork-queen" | "forge-dragon-empress" | "lumen-mirror-dreamer" | "aegis-chain-warden" | "glitch-zero-hour" | "glitch-reset-cantor" | "relay-forktail" | "aegis-veribud" | "lumen-echocoil";
    level: number;
    quality: "prism";
    stats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
    };
};
export declare function expeditionCombat(run: ExpeditionRun, battle: BattleState): ExpeditionCombat;
export declare function advanceExpeditionNode(run: ExpeditionRun): void;
export declare function bankExpeditionShards(state: TraceWildState, amount: number): void;
export declare function offerExpeditionPerks(run: ExpeditionRun): void;
export declare function settleExpeditionVictory(state: TraceWildState): void;
export declare function expeditionActive(state: TraceWildState): boolean;
/** New fields are optional; incompatible runs safely end while settled currency stays intact. */
export declare function restoreExpedition(value: unknown, state: TraceWildState): ExpeditionState;
export declare function restoreExpeditionCombat(value: unknown, run: ExpeditionRun, battle: BattleState): ExpeditionCombat;
//# sourceMappingURL=expedition.d.ts.map