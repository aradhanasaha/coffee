"use client";

import SignUpForm from '@/components/auth/SignUpForm';
import Header from '@/components/layout/Header';

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* Header with default props since we don't need city selection here */}
            <Header selectedCity="Delhi" onSelectCity={() => { }} />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <SignUpForm />
            </div>
        </main>
    );
}
