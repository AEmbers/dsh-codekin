import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { TraceWildAction, TraceWildActionResponse, TraceWildState } from '../../../engine/src/types.ts';
export declare function CompanionLounge(props: {
    state: TraceWildState;
    serverTime: number;
    t: PropsLocale<'tracewild'>['t'];
    zh: boolean;
    busy: boolean;
    reducedMotion: boolean;
    act: (action: TraceWildAction) => Promise<TraceWildActionResponse | undefined>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CompanionLounge.d.ts.map