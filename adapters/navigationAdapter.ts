/**
 * Navigation Adapter
 * Platform-specific implementation for navigation
 * Allows swapping Next.js router for React Navigation (mobile) in the future
 */

/**
 * Interface for navigation adapter
 */
export interface NavigationAdapter {
    push(path: string): void;
    replace(path: string): void;
    back(): void;
    refresh(): void;
}

/**
 * Next.js implementation of NavigationAdapter
 * This should only be imported in Next.js-specific code
 */
export class NextJsNavigationAdapter implements NavigationAdapter {
    private router: any;

    constructor(router: any) {
        this.router = router;
    }

    push(path: string): void {
        this.router.push(path);
    }

    replace(path: string): void {
        this.router.replace(path);
    }

    back(): void {
        this.router.back();
    }

    refresh(): void {
        this.router.refresh();
    }
}

/**
 * Create Next.js navigation adapter
 * This function should be called from components that have access to useRouter
 */
export function createNextJsNavigationAdapter(router: any): NavigationAdapter {
    return new NextJsNavigationAdapter(router);
}
