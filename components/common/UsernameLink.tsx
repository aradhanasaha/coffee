interface UsernameLinkProps {
    username: string;
    onClick?: (username: string) => void;
    className?: string;
}

export default function UsernameLink({ username, onClick, className = "" }: UsernameLinkProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) {
            onClick(username);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`text-primary hover:underline font-medium cursor-pointer ${className}`}
        >
            @{username}
        </button>
    );
}
