import type { ExpeditionPerk } from '../../../engine/src/expedition-types.ts';
export type ExpeditionGlyph = 'unknown' | 'fork' | 'shield' | 'mirror' | 'crown' | 'shard' | 'material' | 'charge' | 'burst' | 'repair' | 'beacon' | 'safe' | 'risk';
export declare function ExpeditionIcon({ kind, className }: {
    kind: ExpeditionGlyph;
    className?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
export declare const PERK_VISUALS: Record<ExpeditionPerk, {
    icon: ExpeditionGlyph;
    value: string;
}>;
/** Every marker is a real combat or interactive event, never a decorative stop. */
export declare function ExpeditionRouteMap({ stage, done, zh, onInspect, finalName }: {
    stage: number;
    done: readonly number[];
    zh: boolean;
    onInspect: (stage: number) => void;
    finalName?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
export declare function RouteIllustration({ kind }: {
    kind: 'safe' | 'risk' | 'repair' | 'beacon';
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ExpeditionGraphics.d.ts.map