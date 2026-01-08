"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import CoffeeFeed from "@/components/features/CoffeeFeed";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [hasLogs, setHasLogs] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLogs = async () => {
            const { count, error } = await supabase
                .from('coffee_logs')
                .select('*', { count: 'exact', head: true });

            if (!error && count && count > 0) {
                setHasLogs(true);
            }
            setLoading(false);
        };
        checkLogs();
    }, []);

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} />

            <div className="container mx-auto max-w-5xl px-4 py-12 flex-1 flex flex-col items-center gap-12">
                {/* Hero Section */}
                <section className="flex flex-col items-center text-center gap-6 max-w-2xl">
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl bg-card flex items-center justify-center">
                        <Image
                            src="/catcoffee.gif"
                            alt="Cat in a coffee cup"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                            imnotupyet.com
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-primary/60 italic">
                            this page is still brewing...
                        </p>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Link
                            href="/signup"
                            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                        >
                            Join the Club
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-3 bg-card text-primary font-bold rounded-2xl border-2 border-primary/20 hover:bg-primary/5 transition-all"
                        >
                            Log In
                        </Link>
                    </div>
                </section>

                {/* Discovery Feed Section */}
                <section className="w-full space-y-8 pt-12 border-t border-primary/10">
                    <div className="flex flex-col items-center text-center gap-2">
                        <h2 className="text-3xl font-bold text-primary">Discovery Feed</h2>
                        <p className="text-muted-foreground">See what the community is sipping on</p>
                    </div>

                    <div className="w-full">
                        <CoffeeFeed selectedCity="All" limit={3} />
                    </div>

                    <div className="flex justify-center pt-8">
                        <Link
                            href="/signup"
                            className="text-primary font-bold hover:underline flex items-center gap-2 text-lg"
                        >
                            Sign up to see more logs and start your own →
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
