"use client";

import { ReactNode } from 'react';

interface FormContainerProps {
    title: string;
    children: ReactNode;
}

export default function FormContainer({ title, children }: FormContainerProps) {
    return (
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary">{title}</h2>
            {children}
        </div>
    );
}
