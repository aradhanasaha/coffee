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
                setUser(session.user);
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} user={user} />

            <div className="container mx-auto max-w-5xl px-4 py-8 flex-1 flex flex-col gap-8">
                <section>
                    <LogCoffeeAction />
                </section>

                <section className="flex-1">
                    <CoffeeFeed selectedCity={selectedCity} />
                </section>
            </div>
        </main>
    );
}
