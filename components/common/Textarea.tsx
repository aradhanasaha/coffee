"use client";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={props.id} className="block text-sm font-medium text-foreground">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors resize-none ${className}`.trim()}
                {...props}
            />
            {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}
