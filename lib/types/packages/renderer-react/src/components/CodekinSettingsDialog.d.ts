import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { UiPreferences } from '../motion.ts';
export declare function CodekinSettingsDialog(props: {
    t: PropsLocale<'tracewild'>['t'];
    preferences: UiPreferences;
    saved: boolean;
    update: (value: UiPreferences) => void;
    close: () => void;
    resetWindow: () => void;
    resetLauncher: () => void;
    refresh: () => Promise<void>;
    enabled: boolean | undefined;
    online: boolean;
    busy: boolean;
    inBattle: boolean;
    setEnabled: (enabled: boolean) => Promise<boolean>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CodekinSettingsDialog.d.ts.map