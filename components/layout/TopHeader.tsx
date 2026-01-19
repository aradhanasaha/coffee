"use client";

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface TopHeaderProps {
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    onShareClick?: () => void;
}

const CITIES = ['Delhi', 'Gurgaon', 'Mumbai', 'Kolkata', 'Bengaluru'];

export default function TopHeader({ selectedCity = 'Delhi', onCityChange, onShareClick }: TopHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleCitySelect = (city: string) => {
        onCityChange?.(city);
        setIsDropdownOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-journal-bg flex items-center justify-between px-8 lowercase z-50">
            {/* Empty left side for balance */}
            <div className="flex-1" />

            {/* Logo + Title - centered */}
            <div className="flex items-center gap-2 text-journal-text">
                <Image src="/logo.png" alt="imnotupyet logo" width={20} height={20} />
                <span className="font-semibold text-base">imnotupyet</span>
            </div>

            {/* Right side actions */}
            <div className="flex-1 flex justify-end items-center gap-4">
                {/* City Selector Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-journal-text hover:opacity-70 transition-opacity text-sm font-medium"
                    >
                        {selectedCity.toLowerCase()}
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-journal-card rounded-lg shadow-lg border border-journal-text/10 py-1 z-10">
                            {CITIES.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleCitySelect(city)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-journal-text/5 transition-colors ${city === selectedCity
                                            ? 'text-journal-text font-semibold'
                                            : 'text-journal-text/70'
                                        }`}
                                >
                                    {city.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Share with friends */}
                <button
                    onClick={onShareClick}
                    className="text-journal-text hover:opacity-70 transition-opacity text-sm font-medium"
                >
                    share with friends
                </button>
            </div>
        </header>
    );
}
