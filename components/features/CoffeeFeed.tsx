"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Star } from 'lucide-react';

interface CoffeeLog {
    id: string;
    coffee_name: string;
    place: string;
    rating: number;
    price: number | null;
    review: string | null;
    flavor_notes: string | null;
    created_at: string;
}

interface CoffeeFeedProps {
    selectedCity: string;
}

export default function CoffeeFeed({ selectedCity }: CoffeeFeedProps) {
    const [logs, setLogs] = useState<CoffeeLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                // Start building the query
                let query = supabase
                    .from('coffee_logs')
                    .select('*')
                    .order('created_at', { ascending: false });

                // If selectedCity is not "All" and not "Delhi" (default), we might want to filter
                // But currently our schema doesn't have a 'city' column, only 'place'.
                // For now, we'll just show all logs since we don't have city data in the table yet.
                // In a real app, we'd add a city column or infer it.

                const { data, error } = await query;

                if (error) throw error;
                setLogs(data || []);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedCity]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-card/50 animate-pulse border-2 border-primary/10" />
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border-2 border-dashed border-primary/20">
                <p>No coffee logs yet. Be the first to log one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
                <div key={log.id} className="group bg-card hover:bg-card/80 border-2 border-primary/10 hover:border-primary/30 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-primary leading-tight">{log.coffee_name}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{log.place}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                            <span className="font-bold text-secondary-foreground">{log.rating}</span>
                            <Star className="w-3 h-3 fill-current text-secondary-foreground" />
                        </div>
                    </div>

                    {log.review && (
                        <p className="text-sm text-foreground/80 line-clamp-3 italic">
                            "{log.review}"
                        </p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/5">
                        <div className="flex gap-2 text-xs text-muted-foreground">
                            {log.price && (
                                <span className="font-medium text-foreground">₹{log.price}</span>
                            )}
                        </div>
                        {log.flavor_notes && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium truncate max-w-[120px]">
                                {log.flavor_notes}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
