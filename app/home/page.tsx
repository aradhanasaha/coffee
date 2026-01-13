"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/layout/Header";
import CoffeeFeed from "@/components/features/CoffeeFeed";
import LogCoffeeAction from "@/components/features/LogCoffeeAction";

export default function AuthenticatedHome() {
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                // Check if user has a profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('user_id', session.user.id)
                    .single();

                if (!profile) {
                    router.push('/set-username');
                } else {
                    setUser({ ...session.user, username: profile.username });
                }
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    // Navigation handler for username clicks
    const handleUsernameClick = (username: string) => {
        router.push(`/user/${username}`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} user={user} />

            <div className="container mx-auto max-w-5xl px-4 py-8 flex-1 flex flex-col gap-8">
                <section>
                    <LogCoffeeAction />
                </section>

                <section className="flex-1">
                    <CoffeeFeed
                        selectedCity={selectedCity}
                        onUsernameClick={handleUsernameClick}
                    />
                </section>
            </div>
        </div>
    );
}
