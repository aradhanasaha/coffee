/**
 * UsernameLink Component
 * Reusable component for clickable usernames
 * 
 * ARCHITECTURE NOTE:
 * This component is pure presentational and contains NO routing logic.
 * Navigation is delegated to parent components via onClick callback.
 * This ensures compatibility across web and future mobile platforms.
 */

import Link from 'next/link';

interface UsernameLinkProps {
    username: string;
    onClick?: (username: string) => void;
    href?: string;
    className?: string;
}

export default function UsernameLink({
    username,
    onClick,
    href,
    className = ''
}: UsernameLinkProps) {
    const defaultClassName = "text-xs bg-primary/5 text-primary/80 hover:text-primary px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer";
    const combinedClassName = className || defaultClassName;

    // If onClick provided, use button behavior
    if (onClick) {
        return (
            <button
                type="button"
                onClick={() => onClick(username)}
                className={combinedClassName}
            >
                @{username}
            </button>
        );
    }

    // If href provided, use as Link
    if (href) {
        return (
            <Link href={href} className={combinedClassName}>
                @{username}
            </Link>
        );
    }

    // Default: construct href from username
    return (
        <Link href={`/user/${username}`} className={combinedClassName}>
            @{username}
        </Link>
    );
}
