import { Component } from 'react';
import type { ReactNode } from 'react';
/** A renderer failure must leave a small, independent route to compatible downloads. */
export declare class CodekinStartupBoundary extends Component<{
    children: ReactNode;
    zh: boolean;
}, {
    failed: boolean;
}> {
    state: {
        failed: boolean;
    };
    static getDerivedStateFromError(): {
        failed: boolean;
    };
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | null | undefined;
}
//# sourceMappingURL=CodekinStartupBoundary.d.ts.map