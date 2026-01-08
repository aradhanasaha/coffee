"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import CoffeeFeed from "@/components/features/CoffeeFeed";

export default function Home() {
    const [selectedCity, setSelectedCity] = useState("Delhi");

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} />

            <div className="container mx-auto max-w-5xl px-4 py-8 flex-1 flex flex-col gap-8">
                <section className="flex-1">
                    <CoffeeFeed selectedCity={selectedCity} />
                </section>
            </div>
        </main>
    );
}
