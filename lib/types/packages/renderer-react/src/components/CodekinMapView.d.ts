import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { TraceWildSnapshot, TraceWildAction } from '../../../engine/src/types.ts';
type Translate = PropsLocale<'tracewild'>['t'];
export declare function CodekinMapView(props: {
    state: TraceWildSnapshot['state'];
    serverTime: number;
    t: Translate;
    zh: boolean;
    busy: boolean;
    reducedMotion: boolean;
    start: (encounterId: string) => void;
    act: (action: TraceWildAction) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CodekinMapView.d.ts.map