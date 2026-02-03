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
        <Link href={`/lists/${list.id}`} className="block group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary/10 mb-3">
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
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <List className="w-12 h-12 opacity-20" />
                    </div>
                )}

                {/* Gradient Overlay - Subtle for depth */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
            </div>

            {/* Content Below */}
            <div>
                <h3 className="font-semibold text-primary text-sm line-clamp-2 leading-tight group-hover:opacity-80 transition-opacity">
                    {list.name}
                </h3>
            </div>
        </Link>
    );
}
