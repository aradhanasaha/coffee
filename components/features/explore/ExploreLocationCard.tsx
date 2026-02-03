"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { CoffeeLog } from "@/core/types/types";

interface ExploreLocationCardProps {
    log: CoffeeLog;
}

export default function ExploreLocationCard({ log }: ExploreLocationCardProps) {
    return (
        <Link
            href={`/locations/${log.location_id || 'unknown'}`}
            className="block group relative aspect-square overflow-hidden rounded-2xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300"
        >
            {/* Image */}
            {log.image_url ? (
                <Image
                    src={log.image_url}
                    alt={log.place}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
            ) : (
                <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center text-muted-foreground">
                    <MapPin className="w-8 h-8 opacity-20" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                    {log.place}
                </h3>
                {/* Optional: Add rating or other minimal info */}
            </div>
        </Link>
    );
}
