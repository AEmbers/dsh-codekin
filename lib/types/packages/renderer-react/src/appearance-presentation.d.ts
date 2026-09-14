import type { CapturedCreature, CreatureAppearance } from '../../engine/src/types.ts';
export type CreatureLook = Pick<CapturedCreature, 'level' | 'appearance'> & {
    instanceId?: string | undefined;
};
export declare const APPEARANCE_MOTION: {
    readonly evolution: 1400;
    readonly change: 380;
};
export declare function resolveCreatureSprite(creatureId: string, look?: CreatureLook): {
    source: string | undefined;
    fallback: string | undefined;
    appearance: CreatureAppearance;
};
export interface PresentedAppearance {
    identity: string;
    level: number;
    source: string | undefined;
    appearance: CreatureAppearance;
}
export declare function appearanceTransition(previous: PresentedAppearance, next: PresentedAppearance): 'none' | 'change' | 'evolution';
export declare function isCreatureImageReady(source: string | undefined): boolean;
/** Share pending work and retain a small decoded working set for portrait changes. */
export declare function decodeCreatureImage(source: string, priority?: 'high' | 'low'): Promise<boolean>;
//# sourceMappingURL=appearance-presentation.d.ts.map