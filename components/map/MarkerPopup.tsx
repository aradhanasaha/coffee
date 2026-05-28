"use client";

import { X, MapPin, Calendar, Hash } from 'lucide-react';
import type { CoffeeMapPin } from '@/core/types/types';

interface MarkerPopupProps {
    pin: CoffeeMapPin;
    onClose: () => void;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function MarkerPopup({ pin, onClose }: MarkerPopupProps) {
    return (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-10 animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-journal-card rounded-2xl shadow-xl border border-journal-text/10 overflow-hidden">
                {pin.latest_image && (
                    <div className="w-full h-32 overflow-hidden">
                        <img
                            src={pin.latest_image}
                            alt={pin.place_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-journal-text text-sm leading-snug lowercase line-clamp-2">
                            {pin.place_name}
                        </h3>
                        <button
                            onClick={onClose}
                            className="shrink-0 p-1 rounded-full hover:bg-journal-text/10 text-journal-text/40 hover:text-journal-text transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        {pin.city && (
                            <div className="flex items-center gap-1.5 text-xs text-journal-text/60">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="lowercase">{pin.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-journal-text/60">
                            <Hash className="w-3 h-3 shrink-0" />
                            <span className="lowercase">
                                {pin.visit_count} {pin.visit_count === 1 ? 'visit' : 'visits'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-journal-text/60">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span className="lowercase">last visited {formatDate(pin.last_visited)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
