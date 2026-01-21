"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from "@/components/landing/Navbar";
import Headline from "@/components/landing/Headline";
import HeroArt from "@/components/landing/HeroArt";
import Slogan from "@/components/landing/Slogan";

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [showLanding, setShowLanding] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (user) {
                // User is logged in, redirect to home feed
                router.replace('/home');
            } else {
                // Not logged in, show landing page
                setShowLanding(true);
            }
        }
    }, [user, loading, router]);

    // Show loading state while checking auth
    if (loading || !showLanding) {
        return (
            <div className="h-screen bg-journal-bg flex items-center justify-center">
                <div className="text-journal-text lowercase animate-pulse">loading...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-journal-bg flex flex-col overflow-hidden">
            <div className="flex-shrink-0">
                <Navbar />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <Headline />
                <HeroArt />
                <Slogan />
            </div>
        </div>
    );
}
