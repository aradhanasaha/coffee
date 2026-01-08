"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CitySelectorProps {
    selectedCity: string;
    onSelectCity: (city: string) => void;
}

const CITIES = ["Delhi", "New York", "London", "Tokyo", "Paris", "Berlin"];

export default function CitySelector({ selectedCity, onSelectCity }: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-bold hover:bg-secondary/80 transition-colors border-2 border-primary/20 shadow-sm"
            >
                {selectedCity === "All" ? "Select City" : selectedCity}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card text-card-foreground rounded-xl shadow-xl border-2 border-primary/20 py-2 z-50 overflow-hidden">
                        <button
                            onClick={() => {
                                onSelectCity("All");
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors ${selectedCity === "All" ? "bg-primary/5" : ""}`}
                        >
                            All Cities
                        </button>
                        {CITIES.map((city) => (
                            <button
                                key={city}
                                onClick={() => {
                                    onSelectCity(city);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors ${selectedCity === city ? "bg-primary/5" : ""}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
