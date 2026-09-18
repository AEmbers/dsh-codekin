export declare const EXPEDITION_BOSS_IDS: readonly ["relay-fork-queen", "forge-dragon-empress", "lumen-mirror-dreamer", "aegis-chain-warden", "glitch-zero-hour", "glitch-reset-cantor"];
export type ExpeditionBossId = typeof EXPEDITION_BOSS_IDS[number];
export declare const isExpeditionBoss: (value: unknown) => value is ExpeditionBossId;
export declare const EXPEDITION_SHOP_ITEMS: readonly [{
    readonly id: "xp-pulse";
    readonly quality: "pulse";
    readonly cost: 4;
    readonly xp: number;
    readonly zh: "脉冲经验芯片";
    readonly en: "Pulse XP Chip";
}, {
    readonly id: "xp-prism";
    readonly quality: "prism";
    readonly cost: 9;
    readonly xp: number;
    readonly zh: "棱镜经验芯片";
    readonly en: "Prism XP Chip";
}, {
    readonly id: "xp-nova";
    readonly quality: "nova";
    readonly cost: 22;
    readonly xp: number;
    readonly zh: "新星经验芯片";
    readonly en: "Nova XP Chip";
}];
export type ExpeditionShopItemId = typeof EXPEDITION_SHOP_ITEMS[number]['id'];
/** Visible only after the last node reveals its encounter. */
export declare const EXPEDITION_BOSS_RULES: Record<ExpeditionBossId, {
    zh: string;
    en: string;
    guard: number;
}>;
//# sourceMappingURL=expedition-catalog.d.ts.map