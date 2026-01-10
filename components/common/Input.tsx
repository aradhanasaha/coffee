"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={props.id} className="block text-sm font-medium text-foreground">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors ${className}`.trim()}
                {...props}
            />
            {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}
