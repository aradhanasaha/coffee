"use client";

import { Star, Heart, Coffee } from 'lucide-react';
import Image from 'next/image';
import { LocationDetailsExtended } from '@/services/locationService';

interface LocationHeaderProps {
    location: LocationDetailsExtended;
    onLogCoffee: () => void;
}

export default function LocationHeader({ location, onLogCoffee }: LocationHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Cover Image */}
            <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm">
                {location.cover_image_url ? (
                    <Image
                        src={location.cover_image_url}
                        alt={location.place_name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Coffee className="w-16 h-16 text-primary/20" />
                    </div>
                )}
                
                {/* Gradient Overlay for text visibility if needed, though design has text below */}
            </div>

            {/* Header Content */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-journal-text mb-2">
                            {location.place_name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                            star <= Math.round(location.average_rating)
                                                ? 'fill-accent text-accent'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-bold text-journal-text">
                                {location.average_rating}
                            </span>
                            <span className="text-journal-text/60">
                                · {location.review_count} reviews
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                         <button 
                            onClick={onLogCoffee}
                            className="flex items-center gap-2 bg-journal-card hover:bg-white border border-journal-text/10 px-4 py-2 rounded-xl text-journal-text font-medium text-sm transition-colors shadow-sm"
                         >
                            <Coffee className="w-4 h-4" />
                            Log coffee
                         </button>
                         <button className="flex items-center justify-center bg-journal-card hover:bg-white border border-journal-text/10 w-10 h-10 rounded-xl text-journal-text transition-colors shadow-sm">
                            <Heart className="w-5 h-5" />
                         </button>
                    </div>
                </div>

                {/* Description */}
                <p className="text-journal-text/80 leading-relaxed max-w-2xl">
                    {location.description || "No description available yet."}
                </p>
            </div>
        </div>
    );
}
