"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import CoffeeFeed from "@/components/features/CoffeeFeed";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/common";

export default function Home() {
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setLoading(false);
    }, []);

    // Navigation handler for username clicks
    const handleUsernameClick = (username: string) => {
        router.push(`/user/${username}`);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
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
                        <Link href="/signup">
                            <Button size="lg" className="px-8">
                                Join the Club
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="secondary" size="lg" className="px-8">
                                Log In
                            </Button>
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
                        <CoffeeFeed
                            selectedCity="All"
                            limit={3}
                            onUsernameClick={handleUsernameClick}
                        />
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
        </div>
    );
}
