"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function LogCoffeeAction() {
    return (
        <Link
            href="/log"
            className="w-full bg-card hover:bg-card/80 border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer block"
        >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-primary">Log a Coffee</h3>
                <p className="text-muted-foreground">Record your latest caffeine fix</p>
            </div>
        </Link>
    );
}
