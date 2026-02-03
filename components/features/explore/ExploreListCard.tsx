"use client";

import Image from "next/image";
import { List } from "lucide-react";
import Link from "next/link";

interface ListData {
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    visibility: 'public' | 'private';
    created_at: string;
    items?: {
        coffee_log: {
            image_url: string | null;
        } | null;
    }[];
}

interface ExploreListCardProps {
    list: ListData;
}

export default function ExploreListCard({ list }: ExploreListCardProps) {
    // Find first image for thumbnail
    const firstImage = list.items?.find(item => item.coffee_log?.image_url)?.coffee_log?.image_url;

    return (
        <Link href={`/lists/${list.id}`} className="block group relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300">
            {/* Thumbnail Image */}
            {firstImage ? (
                <Image
                    src={firstImage}
                    alt={list.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
            ) : (
                <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center text-muted-foreground">
                    <List className="w-12 h-12 opacity-20" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                    {list.name}
                </h3>
                {/* Optional: Add user name or item count if available in data */}
                {/* <p className="text-white/60 text-xs mt-1">By Aradhana</p> */}
            </div>
        </Link>
    );
}
