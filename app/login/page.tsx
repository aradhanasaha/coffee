"use client";

import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* Header with default props */}
            <Header selectedCity="Delhi" onSelectCity={() => { }} />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <LoginForm />
            </div>
        </main>
    );
}
