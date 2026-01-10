"use client";

import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-bold rounded-xl transition-all focus:outline-none';

    const variantStyles = {
        primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border-2 border-primary/20',
        tertiary: 'bg-transparent text-primary border-2 border-dashed border-primary/30 hover:border-primary/60 hover:text-primary'
    };

    const sizeStyles = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2',
        lg: 'px-4 py-3 w-full'
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

    return (
        <button
            disabled={disabled}
            className={combinedClassName}
            {...props}
        />
    );
}
