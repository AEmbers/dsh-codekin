import type { ReactNode } from 'react';
/** Keep modal geometry and inert content inside the movable plugin window. */
export declare function PanelDialogScope({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
interface PanelDialogProps {
    title: string;
    closeLabel: string;
    onClose: () => void;
    children: ReactNode;
    id?: string;
    restoreFocusTo?: HTMLElement | null | undefined;
}
export declare function PanelDialog(props: PanelDialogProps): import("react").ReactPortal | null;
export declare function PageControls(props: {
    page: number;
    pages: number;
    onChange: (page: number) => void;
    zh: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function usePagination<T>(items: readonly T[], size: number, resetKey?: string): {
    page: number;
    pages: number;
    onChange: import("react").Dispatch<import("react").SetStateAction<number>>;
    items: T[];
};
export declare function StoryPages(props: {
    body: string;
    zh: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelDialog.d.ts.map