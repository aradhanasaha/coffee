"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [showForm, setShowForm] = useState(false);

    // Redirect to home if already logged in
    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/home');
            } else {
                setShowForm(true);
            }
        }
    }, [user, loading, router]);

    const handleLoginSuccess = () => {
        router.push('/home');
    };

    // Show loading while checking auth status
    if (loading || !showForm) {
        return (
            <main className="min-h-screen bg-cream flex flex-col">
                <Header hideCitySelector />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-journal-text lowercase animate-pulse">loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cream flex flex-col">
            {/* Header with default props */}
            <Header hideCitySelector />

            <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                <LoginForm onSuccess={handleLoginSuccess} />
            </div>
        </main>
    );
}
